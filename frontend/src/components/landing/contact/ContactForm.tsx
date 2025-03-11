import {useForm} from "react-hook-form";

interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

const ContactForm = () => {
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<ContactFormData>();

    const onSubmit = async (data: ContactFormData) => {
        // TODO
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-background rounded-xl border border-border">
            <h3 className="text-xl font-semibold text-text-primary mb-6">
                Wyślij wiadomość
            </h3>

            <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                        Imię lub nazwa firmy
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
                        {...register('name', {required: 'To pole jest wymagane'})}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-status-error">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
                        {...register('email', {
                            required: 'To pole jest wymagane',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Nieprawidłowy adres email'
                            }
                        })}
                    />
                    {errors.email && (
                        <p className="mt-1  text-sm text-status-error">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                        Telefon (opcjonalnie)
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
                        {...register('phone')}
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                        Wiadomość
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
                        {...register('message', {required: 'To pole jest wymagane'})}
                    />
                    {errors.message && (
                        <p className="mt-1 text-sm text-status-error">
                            {errors.message.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
                >
                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
            </div>
        </form>
    );
};

export default ContactForm;