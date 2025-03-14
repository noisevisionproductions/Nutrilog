import Logo from '../components/ui/landing/Logo';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Login = () => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            {/* Przycisk powrotu */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg text-primary hover:bg-white transition-colors group"
            >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Powrót do strony głównej</span>
            </Link>

            {/* Lewa strona-grafika/gradient */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 text-white items-center justify-center">
                <div className="max-w-md">
                    <h1 className="text-4xl font-bold mb-6">Panel Administratora</h1>
                    <p className="text-lg text-white/90">
                        Witaj w panelu administracyjnym Szytej Diety. Zaloguj się, aby zarządzać dietami, użytkownikami i treścią.
                    </p>
                </div>
            </div>

            {/* Prawa strona-formularz logowania */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center">
                        <Link to="/" className="mb-6 hover:opacity-80 transition-opacity">
                            <Logo asLink={false} />
                        </Link>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            Zaloguj się do panelu
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Wprowadź swoje dane logowania, aby uzyskać dostęp
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <LoginForm />
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Nie masz dostępu? {' '}
                        <a href="mailto:kontakt@szytadieta.pl" className="text-primary hover:text-primary-dark">
                            Skontaktuj się z administratorem
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;