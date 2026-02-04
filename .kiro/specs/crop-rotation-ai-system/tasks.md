# Implementation Plan: Crop Rotation AI System

## Overview

This implementation plan breaks down the Crop Rotation AI System into discrete, incremental coding tasks. The system will be built in layers: data storage, analysis components, recommendation engine, integration layer, and presentation layer. Each task builds on previous work, with testing integrated throughout to validate correctness early.

## Tasks

- [ ] 1. Set up database schema and data layer
  - Create PostgreSQL tables for field_row_history, history_problems, history_amendments, rotation_patterns, and companion_relationships
  - Implement table partitioning by year for field_row_history
  - Create all necessary indexes for query optimization
  - Set up Redis cache for nutrient balance and disease pressure calculations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 12.2_

- [ ] 2. Implement Field Row History Store
  - [ ] 2.1 Create TypeScript interfaces and types for history data models
    - Define FieldRowHistoryRecord, ProblemRecord, AmendmentRecord, NutrientContent interfaces
    - Create enums for CropFamily, QualityRating, problem types
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ] 2.2 Implement history storage operations
    - Write addHistoryRecord, updateHarvestData, addProblem methods
    - Implement getFieldRowHistory with date range filtering
    - Add transaction support for atomic updates
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.3 Write property test for history record completeness
    - **Property 1: History Record Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [ ]* 2.4 Write property test for data retention
    - **Property 2: History Data Retention**
    - **Validates: Requirements 1.6**

- [ ] 3. Implement Nutrient Calculator
  - [ ] 3.1 Create nutrient consumption database
    - Build lookup table mapping crop types to nutrient requirements per unit yield
    - Include data for N, P, K, and key micronutrients
    - _Requirements: 2.1_

  - [ ] 3.2 Implement nutrient balance calculation logic
    - Write calculateBalance method with historical consumption tracking
    - Implement projectBalance for future crop scenarios
    - Add natural replenishment rate calculations based on soil type
    - Implement caching with Redis for performance
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.3_

  - [ ]* 3.3 Write property test for nutrient consumption calculation
    - **Property 3: Nutrient Consumption Calculation**
    - **Validates: Requirements 2.1**

  - [ ]* 3.4 Write property test for nutrient balance updates
    - **Property 4: Nutrient Balance Updates**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 3.5 Write property test for independent nutrient tracking
    - **Property 5: Independent Nutrient Tracking**
    - **Validates: Requirements 2.4**

  - [ ]* 3.6 Write property test for natural replenishment
    - **Property 6: Natural Nutrient Replenishment**
    - **Validates: Requirements 2.5**

  - [ ]* 3.7 Write property test for calculation caching
    - **Property 32: Calculation Caching**
    - **Validates: Requirements 12.3**

- [ ] 4. Implement Disease Pressure Analyzer
  - [ ] 4.1 Create crop family disease relationship database
    - Build database of crop families and shared diseases
    - Define disease pressure scoring constants
    - _Requirements: 3.6_

  - [ ] 4.2 Implement disease pressure calculation algorithm
    - Write calculatePressure with 3-year time window
    - Implement recency weighting and decay functions
    - Add support for related family pressure calculations
    - Implement caching for pressure scores
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.3 Write property test for disease pressure time window
    - **Property 7: Disease Pressure Time Window**
    - **Validates: Requirements 3.1**

  - [ ]* 4.4 Write property test for pressure accumulation
    - **Property 8: Disease Pressure Accumulation**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 4.5 Write property test for pressure decay
    - **Property 9: Disease Pressure Decay**
    - **Validates: Requirements 3.4**

  - [ ]* 4.6 Write property test for independent family scores
    - **Property 10: Independent Family Pressure Scores**
    - **Validates: Requirements 3.5**

  - [ ]* 4.7 Write property test for related family pressure
    - **Property 11: Related Family Pressure**
    - **Validates: Requirements 3.6**

- [ ] 5. Checkpoint - Ensure core analysis components work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Pattern Analyzer
  - [ ] 6.1 Implement pattern extraction from historical data
    - Extract 2-crop and 3-crop sequences from field row history
    - Calculate yield improvements and problem frequencies
    - Implement recency weighting with exponential decay
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.2 Implement pattern classification and scoring
    - Classify patterns as successful, unsuccessful, or neutral
    - Calculate confidence scores based on sample size
    - Implement fallback to general agronomic principles
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 6.3 Write property test for pattern classification
    - **Property 12: Pattern Classification**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 6.4 Write property test for recency weighting
    - **Property 13: Recency Weighting**
    - **Validates: Requirements 4.5**

  - [ ]* 6.5 Write property test for fallback suggestions
    - **Property 14: Fallback Suggestions**
    - **Validates: Requirements 4.6**

- [ ] 7. Implement Companion Benefit Analyzer
  - [ ] 7.1 Create companion relationships database
    - Populate companion_relationships table with known relationships
    - Include nitrogen fixation, soil structure, pest reduction benefits
    - _Requirements: 6.4_

  - [ ] 7.2 Implement companion scoring logic
    - Write getCompanionScore method with database lookup
    - Implement getCompanionExplanation for human-readable reasons
    - Add findBestCompanions helper method
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 7.3 Write property test for companion benefit scoring
    - **Property 19: Companion Benefit Scoring**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**

- [ ] 8. Implement Rotation Scorer and Ranker
  - [ ] 8.1 Implement rotation scoring algorithm
    - Write scoreRotationOptions combining all analysis components
    - Implement weighted scoring: nutrients (25%), disease (30%), patterns (20%), companions (15%), preferences (10%)
    - Calculate expected yield improvement, disease risk reduction, soil health scores
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.2 Implement suggestion ranking and filtering
    - Write rankSuggestions with score-based sorting
    - Implement diversity filter to ensure variety of crop families
    - Apply minimum score threshold (>60)
    - Limit to top 5 suggestions
    - _Requirements: 5.1, 5.2_

  - [ ]* 8.3 Write property test for minimum suggestion count
    - **Property 15: Minimum Suggestion Count**
    - **Validates: Requirements 5.1**

  - [ ]* 8.4 Write property test for ranking order
    - **Property 16: Suggestion Ranking Order**
    - **Validates: Requirements 5.2**

  - [ ]* 8.5 Write property test for metrics completeness
    - **Property 17: Suggestion Metrics Completeness**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [ ] 9. Implement Explanation Generator
  - [ ] 9.1 Create explanation generation logic
    - Write generateExplanation with template-based approach
    - Implement generatePrimaryReason based on highest-scoring factor
    - Write generateContributingFactors listing all positive factors
    - Add confidence level calculation based on data availability
    - _Requirements: 5.6, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 9.2 Write property test for explanation presence
    - **Property 18: Suggestion Explanation Presence**
    - **Validates: Requirements 5.6**

  - [ ]* 9.3 Write property test for explanation completeness
    - **Property 29: Explanation Completeness**
    - **Validates: Requirements 11.1, 11.2, 11.3**

  - [ ]* 9.4 Write property test for confidence indication
    - **Property 30: Confidence Level Indication**
    - **Validates: Requirements 11.4**

  - [ ]* 9.5 Write property test for fallback transparency
    - **Property 31: Fallback Mode Transparency**
    - **Validates: Requirements 11.5**

- [ ] 10. Checkpoint - Ensure recommendation engine works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement user preference and constraint integration
  - [ ] 11.1 Create user preference data models
    - Define interfaces for user preferences, exclusions, custom rules
    - Create database tables for storing user preferences
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ] 11.2 Implement preference filtering and scoring
    - Write seed bank filtering logic
    - Implement preference boosting and exclusion filtering
    - Add seasonal appropriateness checking
    - Implement custom rule enforcement
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 11.3 Write property test for seed bank filtering
    - **Property 20: Seed Bank Filtering**
    - **Validates: Requirements 7.1**

  - [ ]* 11.4 Write property test for preference scoring
    - **Property 21: User Preference Scoring**
    - **Validates: Requirements 7.2**

  - [ ]* 11.5 Write property test for exclusion filtering
    - **Property 22: Crop Exclusion Filtering**
    - **Validates: Requirements 7.3**

  - [ ]* 11.6 Write property test for seasonal appropriateness
    - **Property 23: Seasonal Appropriateness**
    - **Validates: Requirements 7.4**

  - [ ]* 11.7 Write property test for custom rule enforcement
    - **Property 24: Custom Rule Enforcement**
    - **Validates: Requirements 7.5**

  - [ ]* 11.8 Write property test for seed bank integration
    - **Property 27: Seed Bank Integration**
    - **Validates: Requirements 9.5**

- [ ] 12. Implement REST API endpoints
  - [ ] 12.1 Create API route handlers
    - Implement GET /api/rotation/suggestions/:fieldRowId
    - Implement GET /api/rotation/history/:fieldRowId
    - Implement GET /api/rotation/visualizations/:fieldRowId
    - Implement POST /api/rotation/selection
    - Implement GET /api/rotation/nutrients/:fieldRowId
    - Implement GET /api/rotation/disease-pressure/:fieldRowId
    - _Requirements: 9.6_

  - [ ] 12.2 Add request validation and error handling
    - Implement input validation for all endpoints
    - Add error handling for all error categories (validation, integrity, calculation, integration, performance)
    - Implement retry logic for external service calls
    - Add transaction rollback for failed updates
    - _Requirements: 9.6_

  - [ ]* 12.3 Write unit tests for API endpoints
    - Test successful requests and responses
    - Test error conditions and status codes
    - Test request validation
    - _Requirements: 9.6_

  - [ ]* 12.4 Write property test for concurrent request isolation
    - **Property 33: Concurrent Request Isolation**
    - **Validates: Requirements 12.4**

- [ ] 13. Implement event listeners for automatic history updates
  - [ ] 13.1 Create event listener service
    - Implement onPlantCreated handler
    - Implement onHarvestRecorded handler
    - Implement onOperationRecorded handler
    - Implement onProblemReported handler
    - Implement onAmendmentApplied handler
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 13.2 Wire event listeners to existing event system
    - Register listeners with event bus
    - Add error handling and retry logic
    - Implement transaction support for atomic updates
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 13.3 Write property test for event-driven updates
    - **Property 26: Event-Driven History Updates**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 14. Implement historical visualization data generation
  - [ ] 14.1 Create visualization data generators
    - Implement timeline data generator (crops by year)
    - Implement yield comparison data generator
    - Implement problem frequency heatmap generator
    - Implement soil health trend calculator
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 14.2 Write property test for visualization data completeness
    - **Property 25: Visualization Data Completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 15. Implement integration with Director Orchestrator
  - [ ] 15.1 Create Director Orchestrator client
    - Implement API client for timing recommendations
    - Add error handling and fallback behavior
    - _Requirements: 9.4_

  - [ ]* 15.2 Write integration test for orchestrator timing
    - Test that suggestions include timing data
    - Test fallback when orchestrator unavailable
    - _Requirements: 9.4_

- [ ] 16. Checkpoint - Ensure all integrations work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement data migration system
  - [ ] 17.1 Create migration scripts
    - Write script to import existing field row crop assignments
    - Write script to import plant operations
    - Write script to import harvest records
    - Add data quality indicators for incomplete records
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 17.2 Add migration error handling and rollback
    - Implement transaction-based migration
    - Add rollback on failure
    - Implement progress tracking and reporting
    - _Requirements: 10.6_

  - [ ]* 17.3 Write property test for incomplete data indicators
    - **Property 28: Incomplete Data Quality Indicators**
    - **Validates: Requirements 10.4**

  - [ ]* 17.4 Write unit tests for migration
    - Test successful migration with sample data
    - Test rollback on failure
    - Test data integrity after migration
    - _Requirements: 10.1, 10.2, 10.3, 10.6_

- [ ] 18. Create UI components for rotation suggestions
  - [ ] 18.1 Create RotationSuggestionsWidget component
    - Display ranked suggestions with scores
    - Show explanations and contributing factors
    - Display confidence levels
    - Add selection interface
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 11.4_

  - [ ] 18.2 Create FieldRowHistoryVisualization component
    - Implement timeline view
    - Implement yield comparison charts
    - Implement problem frequency heatmap
    - Implement soil health trend display
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 18.3 Write unit tests for UI components
    - Test rendering with various data states
    - Test user interactions
    - Test error states
    - _Requirements: 5.1, 8.1_

- [ ] 19. Final integration and end-to-end testing
  - [ ] 19.1 Wire all components together
    - Connect UI to API endpoints
    - Verify event listeners are registered
    - Test complete flow: plant → history → suggestions
    - _Requirements: All_

  - [ ]* 19.2 Write end-to-end integration tests
    - Test complete rotation suggestion workflow
    - Test history tracking across multiple seasons
    - Test migration and data integrity
    - _Requirements: All_

- [ ] 20. Final checkpoint - Ensure system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses TypeScript for type safety and maintainability
- Database uses PostgreSQL with time-series optimizations and Redis for caching
- All external integrations include error handling and fallback behavior
