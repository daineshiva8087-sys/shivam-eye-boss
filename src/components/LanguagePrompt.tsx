import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES, Language } from "@/lib/translations";
import { Globe } from "lucide-react";

export function LanguagePrompt() {
  const { isFirstVisit, setLanguage, setFirstVisitComplete, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>('en');

  const handleContinue = () => {
    setLanguage(selectedLang);
    setFirstVisitComplete();
  };

  return (
    <Dialog open={isFirstVisit} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{t('languagePromptTitle')}</DialogTitle>
          <DialogDescription>{t('languagePromptSubtitle')}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code as Language)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                selectedLang === lang.code
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold text-foreground">{lang.nativeName}</span>
                <span className="text-sm text-muted-foreground">{lang.name}</span>
              </div>
              {selectedLang === lang.code && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
        
        <Button onClick={handleContinue} className="w-full" size="lg">
          {t('continue')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
