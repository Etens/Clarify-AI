import { signIn } from 'next-auth/react';

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <button
                onClick={() => signIn('google')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Login with Google
            </button>
        </div>
    );
};

export default Login;