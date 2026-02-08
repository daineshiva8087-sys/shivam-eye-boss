import { Shield, Award, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-background" id="about">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 security-badge">
            <Award className="h-4 w-4" />
            <span>{t('since')}</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('aboutUs')}
          </h2>

          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>{t('aboutParagraph1')}</p>
            <p>{t('aboutParagraph2')}</p>
            <p className="font-medium text-foreground">{t('aboutParagraph3')}</p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{t('sinceYear')}</span>
              <span className="text-sm text-muted-foreground">{t('inService')}</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{t('trusted')}</span>
              <span className="text-sm text-muted-foreground">{t('securitySolution')}</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{t('quality')}</span>
              <span className="text-sm text-muted-foreground">{t('service')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
