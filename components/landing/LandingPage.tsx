import LandingHeader from './LandingHeader'
import Hero from './sections/Hero'
import SignalTape from './SignalTape'
import ProductGallery from './sections/ProductGallery'
import ReasonWhySection from './sections/ReasonWhySection'
import DecisionScenario from './sections/DecisionScenario'
import PillarTransparency from './sections/PillarTransparency'
import PrecisionEvidence from './sections/PrecisionEvidence'
import PlantIntelligence from './sections/PlantIntelligence'
import PillarTraceability from './sections/PillarTraceability'
import CertificationEvidence from './sections/CertificationEvidence'
import SpecialistCrops from './sections/SpecialistCrops'
import PlanningMemory from './sections/PlanningMemory'
import AudienceSplit from './sections/AudienceSplit'
import FinalCta from './sections/FinalCta'
import LandingFooter from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ortomio-paper font-body text-ortomio-green-900">
      <LandingHeader />
      <main>
        <Hero />
        <SignalTape />
        <ProductGallery />
        <ReasonWhySection />
        <DecisionScenario />
        <PillarTransparency />
        <PrecisionEvidence />
        <PlantIntelligence />
        <PillarTraceability />
        <CertificationEvidence />
        <PlanningMemory />
        <SpecialistCrops />
        <AudienceSplit />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
