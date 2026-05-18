import {useAuthCookie} from './useAuthCookie';

export default function AppCookie() {
    const { token, login, logout } = useAuthCookie();

    return (
        <div>
            <h2>Auth con Cookies</h2>
            {
                token ? (
                    <>
                    <p>Sesión con Cookie Activa</p>
                    <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={login}>Login</button>
                    </>
                )
            }
        </div>
    );
}