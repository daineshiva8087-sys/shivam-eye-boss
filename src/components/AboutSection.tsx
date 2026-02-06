import { Shield, Award, Clock } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-16 bg-background" id="about">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 security-badge">
            <Award className="h-4 w-4" />
            <span>Since 2016</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            About Us
          </h2>

          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              Shivam CCTV ही जालना शहरातील एक विश्वासार्ह CCTV सोल्युशन सेवा आहे.
            </p>
            <p>
              2016 पासून जालनेकरांच्या सेवेत कार्यरत राहून,
              आम्ही घर, दुकान, ऑफिस आणि व्यवसायांसाठी
              आधुनिक व दर्जेदार सुरक्षा उपाय उपलब्ध करून देत आहोत.
            </p>
            <p className="font-medium text-foreground">
              योग्य सल्ला, अचूक इंस्टॉलेशन आणि
              वेळेवर सर्व्हिस हीच आमची ओळख आहे.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">2016 पासून</span>
              <span className="text-sm text-muted-foreground">सेवेत कार्यरत</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">विश्वासार्ह</span>
              <span className="text-sm text-muted-foreground">सुरक्षा सोल्युशन</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">दर्जेदार</span>
              <span className="text-sm text-muted-foreground">सर्व्हिस</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
