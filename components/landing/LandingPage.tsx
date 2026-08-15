import LandingHeader from './LandingHeader'
import Hero from './sections/Hero'
import StatusBanner from './sections/StatusBanner'
import ProblemSection from './sections/ProblemSection'
import PillarTransparency from './sections/PillarTransparency'
import PillarCorrelation from './sections/PillarCorrelation'
import PillarTraceability from './sections/PillarTraceability'
import AudienceSplit from './sections/AudienceSplit'
import BenefitsList from './sections/BenefitsList'
import MaturitySection from './sections/MaturitySection'
import FinalCta from './sections/FinalCta'
import LandingFooter from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <LandingHeader />
      <Hero />
      <StatusBanner />
      <ProblemSection />
      <PillarTransparency />
      <PillarCorrelation />
      <PillarTraceability />
      <AudienceSplit />
      <BenefitsList />
      <MaturitySection />
      <FinalCta />
      <LandingFooter />
    </div>
  )
}
