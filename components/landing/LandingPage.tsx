import LandingHeader from './LandingHeader'
import Hero from './sections/Hero'
import ReasonWhySection from './sections/ReasonWhySection'
import DecisionScenario from './sections/DecisionScenario'
import PillarTransparency from './sections/PillarTransparency'
import HowItWorks from './sections/HowItWorks'
import PillarTraceability from './sections/PillarTraceability'
import SpecialistCrops from './sections/SpecialistCrops'
import PlanningMemory from './sections/PlanningMemory'
import FinalCta from './sections/FinalCta'
import LandingFooter from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ortomio-paper font-body text-ortomio-green-900">
      <LandingHeader />
      <main>
        <Hero />
        <ReasonWhySection />
        <DecisionScenario />
        <PillarTransparency />
        <HowItWorks />
        <PillarTraceability />
        <SpecialistCrops />
        <PlanningMemory />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
