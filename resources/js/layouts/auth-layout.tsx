import TextType from '@/components/TextType';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            titleComponent={
                <TextType
                    as="span"
                    text={title}
                    className="auth-title-font"
                    loop={true}
                    showCursor={true}
                    typingSpeed={35}
                />
            }
            description={description}
            {...props}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
