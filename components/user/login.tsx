import { signIn } from 'next-auth/react';
import { Button } from "@/components/button/button";

const Login = () => {
    return (
        <>
            <Button variant="secondary"
                onClick={() => signIn()}
            >
                Login
            </Button>
        </>
    );
};

export default Login;