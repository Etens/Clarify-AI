import { signOut } from 'next-auth/react';

const Logout = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default Logout;