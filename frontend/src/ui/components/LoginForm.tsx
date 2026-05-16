import { useState } from 'react'
import useLogin from '../../hooks/useLogin'
import Button from './Button'
import Input from './Input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, hasError } = useLogin()

  function handleSubmit() {
    login({ email, password })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <Input name="email" type="email" value={email} onChange={setEmail} placeholder="Email" />
      <Input name="password" type="password" value={password} onChange={setPassword} placeholder="Mot de passe" />
      {hasError && <p>Identifiants invalides</p>}
      <Button type="submit" label="Se connecter" onClick={handleSubmit} disabled={isLoading} />
    </form>
  )
}
