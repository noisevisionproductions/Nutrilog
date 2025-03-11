import { useState } from 'react';
import { useForm } from 'react-hook-form';
import RoleSelector from './RoleSelector';

interface NewsletterFormData {
    email: string;
    role: 'dietetyk' | 'firma';
}

interface NewsletterFormProps {
    className?: string;
    buttonClassName?: string;
}

const NewsletterForm = ({ className = '', buttonClassName = '' }: NewsletterFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm<NewsletterFormData>();
    const selectedRole = watch('role');

    const onSubmit = async (data: NewsletterFormData) => {
        setIsSubmitting(true);
        console.log(data);
        setIsSubmitting(false);
    };

    return (
        <div className="isolate">
            <form onSubmit={handleSubmit(onSubmit)} className={className}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="email"
                            placeholder="Twój adres email"
                            className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                            {...register('email', {
                                required: 'Email jest wymagany',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Nieprawidłowy adres email'
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-status-error">{errors.email.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 ${buttonClassName}`}
                    >
                        {isSubmitting ? 'Zapisywanie...' : 'Zapisz się do listy oczekujących'}
                    </button>
                </div>

                <div className="mt-4">
                    <RoleSelector
                        selectedRole={selectedRole}
                        register={register}
                        error={!!errors.role}
                    />
                </div>
            </form>
        </div>
    );
};

export default NewsletterForm;