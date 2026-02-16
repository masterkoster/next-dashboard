/**
 * Weight & Balance Calculator API
 * Calculate W&B and get aircraft specifications
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'aviation_hub.db');

// Standard passenger weights (including 10 lb allowance for clothing/baggage)
const DEFAULT_PASSENGER_WEIGHT = 170; // lbs

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get list of available aircraft
    const db = new sqlite3.Database(DB_PATH);
    
    db.all("SELECT make, model, empty_weight, empty_cg, max_weight, fuel_capacity, cruise_speed, fuel_burn FROM weight_balance ORDER BY make, model", [], (err, rows) => {
      db.close();
      
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ aircraft: rows });
    });
    return;
  }
  
  if (req.method === 'POST') {
    const { 
      aircraftId,
      make,
      model,
      pilotWeight = DEFAULT_PASSENGER_WEIGHT,
      passengers = 0,
      passengerWeight = DEFAULT_PASSENGER_WEIGHT,
      baggageWeight = 0,
      fuelGallons = 0
    } = req.body;

    if (!make && !model && !aircraftId) {
      return res.status(400).json({ error: 'Aircraft required' });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    // Get aircraft specs
    const getAircraft = aircraftId 
      ? db.get("SELECT * FROM weight_balance WHERE id = ?", [aircraftId])
      : db.get("SELECT * FROM weight_balance WHERE make = ? AND model = ?", [make, model]);

    getAircraft.then(aircraft => {
      if (!aircraft) {
        db.close();
        return res.status(404).json({ error: 'Aircraft not found in database' });
      }

      // Weight & Balance Calculations
      const emptyWeight = aircraft.empty_weight;
      const emptyCG = aircraft.empty_cg;
      const maxWeight = aircraft.max_weight;
      const armPilot = aircraft.arm_pilot;
      const armPassenger = aircraft.arm_passenger;
      const armBaggage = aircraft.arm_baggage;
      const armFuel = aircraft.arm_fuel;
      const unusableFuel = aircraft.unusable_fuel || 2;
      const fuelDensity = 6.0; // lbs per gallon for 100LL

      // Calculate loads
      const pilotLoad = pilotWeight * armPilot;
      const passengerLoad = (passengers * passengerWeight) * armPassenger;
      const baggageLoad = baggageWeight * armBaggage;
      const fuelWeight = (fuelGallons * fuelDensity);
      const fuelLoad = fuelWeight * armFuel;

      // Total weight
      const totalWeight = emptyWeight + pilotLoad / armPilot + passengerLoad + baggageLoad + fuelWeight;
      const actualPassengers = (passengerWeight > 0 ? passengers : 0) + (pilotWeight > 0 ? 1 : 0);

      // Total moment
      const totalMoment = emptyWeight * emptyCG + pilotLoad + passengerLoad + baggageLoad + fuelLoad;
      
      // Calculate CG
      const cg = totalWeight > 0 ? totalMoment / totalWeight : emptyCG;

      // Check if within limits (simplified - assumes CG range of 78-93 inches for most trainers)
      // In reality, would need full envelope from POH
      const cgMin = aircraft.cg_min || 78;
      const cgMax = aircraft.cg_max || 93;
      const isWithinCG = cg >= cgMin && cg <= cgMax;
      const isWithinWeight = totalWeight <= maxWeight;

      // Calculate fuel penalty if overweight
      let fuelPenalty = 0;
      let fuelPenaltyMessage = '';
      
      if (totalWeight > maxWeight) {
        const overweightLbs = totalWeight - maxWeight;
        // Fuel is typically 6 lbs/gallon, reduce that amount
        fuelPenalty = Math.ceil(overweightLbs / fuelDensity);
        fuelPenaltyMessage = `Reduce fuel by ${fuelPenalty} gallons to be within weight limits`;
      }

      // Calculate range with current fuel (reserve-adjusted)
      const usableFuel = Math.max(0, fuelGallons - unusableFuel);
      const cruiseSpeed = aircraft.cruise_speed;
      const fuelBurn = aircraft.fuel_burn;
      
      // Range with reserves (1 hour reserve)
      const reserveFuel = fuelBurn * 1; // 1 hour reserve
      const effectiveRange = usableFuel > reserveFuel 
        ? ((usableFuel - reserveFuel) / fuelBurn) * cruiseSpeed 
        : 0;

      // Range without reserve
      const maxRange = usableFuel > 0 
        ? (usableFuel / fuelBurn) * cruiseSpeed 
        : 0;

      db.close();

      res.json({
        aircraft: {
          make: aircraft.make,
          model: aircraft.model,
          emptyWeight,
          emptyCG,
          maxWeight,
          cruiseSpeed,
          fuelBurn
        },
        input: {
          pilotWeight,
          passengers,
          passengerWeight,
          baggageWeight,
          fuelGallons,
          actualPassengers
        },
        calculations: {
          totalWeight: Math.round(totalWeight),
          cg: Math.round(cg * 100) / 100,
          maxWeight,
          isWithinWeight,
          isWithinCG,
          cgMin,
          cgMax,
          overweightLbs: Math.max(0, totalWeight - maxWeight)
        },
        fuelPenalty: {
          gallons: fuelPenalty,
          message: fuelPenaltyMessage
        },
        range: {
          withReserve: Math.round(effectiveRange),
          max: Math.round(maxRange),
          reserveFuel: Math.round(reserveFuel),
          usableFuel: Math.round(usableFuel)
        },
        warning: !isWithinWeight || !isWithinCG 
          ? `⚠️ ${!isWithinWeight ? 'Overweight' : ''} ${!isWithinCG ? 'CG out of limits' : ''}`.trim()
          : null,
        disclaimer: '⚠️ These are TYPICAL VALUES - verify with actual aircraft documents before flight'
      });
    }).catch(err => {
      db.close();
      console.error('Error:', err);
      res.status(500).json({ error: 'Calculation error' });
    });
    
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
