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
    <form className="form-panel" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <div className="form-heading">Rentre dans le village</div>
      <div className="form-grid">
        <div className="form-field">
          <label className="label" htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" value={email} onChange={setEmail} placeholder="Email" />
        </div>
        <div className="form-field">
          <label className="label" htmlFor="password">Mot de passe</label>
          <Input id="password" name="password" type="password" value={password} onChange={setPassword} placeholder="Mot de passe" />
        </div>
      </div>
      {hasError && <p className="field-error">Identifiants invalides</p>}
      <div className="actions-row">
        <Button type="submit" label={isLoading ? 'Connexion...' : 'Se connecter'} disabled={isLoading} className="button-primary" />
      </div>
    </form>
  )
}
