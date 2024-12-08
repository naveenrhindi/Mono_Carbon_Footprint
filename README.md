# Carbon Neutrality Dashboard - Emission Factors Documentation

This document provides detailed information about the emission factors and calculation methodologies used in the Carbon Neutrality Dashboard.

## Emission Factors

### 1. Excavation Emissions

#### Base Factors
- Coal: 2.42 kg CO2e per kg coal
- Diesel: 2.68 kg CO2e per liter
- Petrol: 2.31 kg CO2e per liter
- Natural Gas: 2.75 kg CO2e per m³ (view only)

#### Mining Method Multipliers
- Surface Mining: 1.2x
  - More efficient due to direct access to coal
  - Lower energy requirement for extraction
- Underground Mining: 1.5x
  - Higher energy requirement due to underground operations
  - Additional ventilation and safety systems

### 2. Transportation Emissions

#### Base Factors
- Diesel: 2.68 kg CO2e per liter
- Electric: 0.5 kg CO2e per kWh
- Hybrid: Calculated based on fuel mix
- Natural Gas: 2.75 kg CO2e per m³ (view only)

#### Transportation Mode Multipliers
- Truck: 1.2x
  - Higher emissions due to individual vehicle operation
  - Flexible but less efficient for large volumes
- Rail: 0.8x
  - More efficient for bulk transportation
  - Lower emissions per tonne-kilometer

### 3. Equipment Usage Emissions

#### Base Factors
- Diesel: 2.68 kg CO2e per liter
- Electric: 0.5 kg CO2e per kWh
- Hybrid: Calculated based on fuel mix
- Natural Gas: 2.75 kg CO2e per m³ (view only)

#### Equipment Type Multipliers
- Excavator: 1.3x
  - Highest factor due to heavy-duty operation
  - Intensive fuel consumption during digging
- Loader: 1.2x
  - Medium-heavy equipment
  - Regular material handling operations
- Drill: 1.1x
  - Lower factor due to specialized operation
  - Intermittent usage pattern

### 4. Methane Emissions

#### Base Factor
- Methane GWP (Global Warming Potential): 25
  - Based on IPCC AR5 100-year GWP

#### Utilization Method Efficiency
- Power Generation: 70% efficiency
  - Conversion to electricity
  - Heat recovery systems
- Ventilation Air Methane: 85% efficiency
  - Direct oxidation
  - Thermal recovery systems

## Calculation Methodology

### 1. Excavation Emissions
```javascript
excavationEmissions = (coalAmount * coalFactor * methodFactor) + (distance * fuelFactor)
```

### 2. Transportation Emissions
```javascript
transportationEmissions = (totalDistance * fuelFactor * modeFactor) + (coalTransported * 0.1)
```

### 3. Equipment Emissions
```javascript
equipmentEmissions = operatingHours * fuelConsumptionPerHour * fuelFactor * equipmentFactor
```

### 4. Methane Emissions
```javascript
effectiveDischarge = dischargeAmount * (1 - captureRate/100)
utilizationFactor = 1 - (conversionEfficiency/100 * methodEfficiency)
methaneEmissions = effectiveDischarge * methaneGWP * utilizationFactor
```

## Notes

1. All emission factors are based on industry standards and research data
2. Natural Gas options are included for reference but disabled in the current version
3. Calculations include both direct and indirect emissions where applicable
4. All results are provided in kilograms of CO2 equivalent (kg CO2e)

## Future Enhancements

1. Additional mining methods and their specific factors
2. More transportation modes and fuel types
3. Equipment-specific consumption patterns
4. Enhanced methane capture and utilization methods
