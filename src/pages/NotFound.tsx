import { useLanguage } from "@/context/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.title")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.backHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
