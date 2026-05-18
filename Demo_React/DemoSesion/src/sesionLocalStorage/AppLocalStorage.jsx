import { useAuthLocalStorage } from "./useAuthLocalStorage";

export default function AppLocalStorage(){
    const { token, login, logout } = useAuthLocalStorage();

    return(
        <div>
            <h2> Auth con localStorage</h2>
            {
                token ? (
                    <> 
                        <p>Sesión Activa</p>
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <button onClick={login}>Login</button>
                )
            }
        </div>
    );
}