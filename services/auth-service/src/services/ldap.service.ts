import { Client } from 'ldapts'
import { env } from '../config/env'
import { log } from '../utils/logger'

export interface LdapUser {
  sAMAccountName: string
  displayName: string
  mail: string
  memberOf: string[]
}

// Échappe les caractères spéciaux LDAP pour éviter l'injection dans les filtres
function escapeLdapFilter(value: string): string {
  return value.replace(/[\\*()\x00]/g, (c) => `\\${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
}

export async function authenticateWithAD(
  username: string,
  password: string
): Promise<LdapUser | null> {
  log.debug('LDAP — début de l\'authentification', {
    category: 'access',
    username,
    ldap_url: env.LDAP_URL,
    base_dn:  env.LDAP_BASE_DN,
  })

  const client = new Client({
    url: env.LDAP_URL,
    tlsOptions: { rejectUnauthorized: false },
  })

  try {
    // 1. Bind avec le compte de service pour la recherche
    log.debug('LDAP — bind compte de service', { category: 'access', bind_dn: env.LDAP_BIND_DN })
    await client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PW)
    log.debug('LDAP — bind compte de service OK', { category: 'access' })

    const filter = `(sAMAccountName=${escapeLdapFilter(username)})`
    log.debug('LDAP — recherche utilisateur', { category: 'access', filter, base_dn: env.LDAP_BASE_DN })

    const { searchEntries } = await client.search(env.LDAP_BASE_DN, {
      scope: 'sub',
      filter,
      attributes: ['displayName', 'mail', 'memberOf', 'sAMAccountName'],
    })

    log.debug('LDAP — résultat recherche', { category: 'access', username, entries_found: searchEntries.length })

    if (!searchEntries.length) {
      log.warn('LDAP — utilisateur introuvable dans l\'annuaire', { category: 'access', username })
      return null
    }

    const entry = searchEntries[0]
    const groups = [entry.memberOf].flat().filter(Boolean) as string[]

    log.debug('LDAP — entrée trouvée', {
      category: 'access',
      dn:           entry.dn,
      displayName:  entry.displayName,
      mail:         entry.mail,
      groups_count: groups.length,
      groups,
    })

    // 2. Validation du mot de passe par un second bind avec le DN de l'utilisateur
    log.debug('LDAP — bind utilisateur (validation mot de passe)', { category: 'access', dn: entry.dn })
    await client.bind(entry.dn, password)
    log.debug('LDAP — bind utilisateur OK — credentials valides', { category: 'access', username })

    return {
      sAMAccountName: entry.sAMAccountName as string,
      displayName:    entry.displayName as string,
      mail:           (entry.mail as string) ?? '',
      memberOf:       groups,
    }
  } catch (err: unknown) {
    const ldapErr = err as { code?: number; message?: string }
    if (ldapErr?.code === 49) {
      log.warn('LDAP — échec bind utilisateur (code 49 — InvalidCredentials)', { category: 'access', username })
      return null
    }
    log.error('LDAP — erreur inattendue', {
      category: 'communication',
      username,
      code:    ldapErr?.code,
      message: ldapErr?.message,
    })
    throw err
  } finally {
    log.debug('LDAP — unbind client', { category: 'access' })
    await client.unbind()
  }
}
