import LandingHeader from './LandingHeader'
import Hero from './sections/Hero'
import AudienceSplit from './sections/AudienceSplit'
import OrchestratorSection from './sections/OrchestratorSection'
import PillarTransparency from './sections/PillarTransparency'
import HowItWorks from './sections/HowItWorks'
import PillarTraceability from './sections/PillarTraceability'
import SpecialistCrops from './sections/SpecialistCrops'
import PlanningMemory from './sections/PlanningMemory'
import MaturitySection from './sections/MaturitySection'
import FinalCta from './sections/FinalCta'
import LandingFooter from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ortomio-paper font-body text-ortomio-green-900">
      <LandingHeader />
      <main>
        <Hero />
        <AudienceSplit />
        <OrchestratorSection />
        <PillarTransparency />
        <HowItWorks />
        <PillarTraceability />
        <SpecialistCrops />
        <PlanningMemory />
        <MaturitySection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
