import { Client } from 'ldapts'
import { env } from '../config/env'
import { log } from '../utils/logger'

export interface LdapUser {
  sAMAccountName: string
  displayName: string
  mail: string
  memberOf: string[]
}

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

  const upn = `${username}@${env.LDAP_DOMAIN}`
  const client = new Client({ url: env.LDAP_URL })

  try {
    // Bind direct avec le UPN de l'utilisateur — valide les credentials sans compte de service
    log.debug('LDAP — bind UPN utilisateur', { category: 'access', upn })
    await client.bind(upn, password)
    log.debug('LDAP — bind OK — credentials valides', { category: 'access', username })

    // Recherche des attributs (groupes, displayName, mail) avec la session de l'utilisateur
    const filter = `(sAMAccountName=${escapeLdapFilter(username)})`
    log.debug('LDAP — recherche attributs', { category: 'access', filter })

    const { searchEntries } = await client.search(env.LDAP_BASE_DN, {
      scope: 'sub',
      filter,
      attributes: ['displayName', 'mail', 'memberOf', 'sAMAccountName'],
    })

    log.debug('LDAP — résultat recherche', { category: 'access', entries_found: searchEntries.length })

    if (!searchEntries.length) {
      log.warn('LDAP — utilisateur introuvable après bind réussi', { category: 'access', username })
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

    return {
      sAMAccountName: entry.sAMAccountName as string,
      displayName:    entry.displayName as string,
      mail:           (entry.mail as string) ?? '',
      memberOf:       groups,
    }
  } catch (err: unknown) {
    const ldapErr = err as { code?: number; message?: string }
    if (ldapErr?.code === 49) {
      log.warn('LDAP — credentials invalides (code 49)', { category: 'access', username })
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
    log.debug('LDAP — unbind', { category: 'access' })
    await client.unbind()
  }
}
