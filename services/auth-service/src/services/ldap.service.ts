import { Client } from 'ldapts'
import { env } from '../config/env'

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
  const client = new Client({
    url: env.LDAP_URL,
    tlsOptions: { rejectUnauthorized: false },
  })

  try {
    // 1. Bind avec le compte de service pour la recherche
    await client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PW)

    const { searchEntries } = await client.search(env.LDAP_BASE_DN, {
      scope: 'sub',
      filter: `(sAMAccountName=${escapeLdapFilter(username)})`,
      attributes: ['displayName', 'mail', 'memberOf', 'sAMAccountName'],
    })

    if (!searchEntries.length) return null

    const entry = searchEntries[0]

    // 2. Validation du mot de passe par un second bind avec le DN de l'utilisateur
    await client.bind(entry.dn, password)

    return {
      sAMAccountName: entry.sAMAccountName as string,
      displayName:    entry.displayName as string,
      mail:           (entry.mail as string) ?? '',
      memberOf:       [entry.memberOf].flat().filter(Boolean) as string[],
    }
  } catch (err: unknown) {
    const ldapErr = err as { code?: number }
    if (ldapErr?.code === 49) return null // InvalidCredentials
    throw err
  } finally {
    await client.unbind()
  }
}
