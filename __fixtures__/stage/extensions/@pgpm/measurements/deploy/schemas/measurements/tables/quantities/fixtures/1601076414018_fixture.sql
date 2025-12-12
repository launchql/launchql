-- Deploy schemas/measurements/tables/quantities/fixtures/1601076414018_fixture to pg

-- requires: schemas/measurements/schema
-- requires: schemas/measurements/tables/quantities/table

BEGIN;

-- https://en.wikipedia.org/wiki/International_System_of_Units
-- https://en.wikipedia.org/wiki/SI_derived_unit

INSERT INTO measurements.quantities (id, name, label, unit, unit_desc, description) VALUES
 (1, 'Acceleration', 'Acceleration', 'm/s²', 'meter per square second', 'the rate of change of velocity with respect to time'),
 (2, 'AmountOfSubstance', 'Amount Of Substance', 'mol', 'molecules, for example of a substance. The system unit for this quantity is "mol" mole', 'the number of elementary entities (molecules, for example) of a substance'),
 (3, 'Angle', 'Angle', 'rad', 'radian', 'the figure formed by two lines diverging from a common point'),
 (4, 'AngularAcceleration', 'Angular Acceleration', 'rad/s²', 'radian per square second', 'the rate of change of angular velocity with respect to time'),
 (5, 'AngularVelocity', 'Angular Velocity', 'rad/s', 'radian per second', 'the rate of change of angular displacement with respect to time'),
 (6, 'Area', 'Area', 'm²', 'square meter', 'the extent of a planar region or of the surface of a solid measured in square units'),
 (7, 'CatalyticActivity', 'Catalytic Activity', 'kat', 'katal', 'a catalytic activity'),
 (8, 'DataAmount', 'Data Amount', 'bit', NULL, 'a measure of data amount'),
 (9, 'DataRate', 'Data Rate', 'bit/s', 'bit per second', 'the speed of data-transmission'),
 (10, 'Dimensionless', 'Dimensionless', NULL, NULL, 'a dimensionless quantity'),
 (11, 'Duration', 'Duration', 's', 'second', 'a period of existence or persistence'),
 (12, 'DynamicViscosity', 'Dynamic Viscosity', 'Pa·s', 'Pascal-Second', 'the dynamic viscosity'),
 (13, 'ElectricCapacitance', 'Electric Capacitance', 'F', 'Farad', 'an electric capacitance'),
 (14, 'ElectricCharge', 'Electric Charge', 'C', 'Coulomb', 'an electric charge'),
 (15, 'ElectricConductance', 'Electric Conductance', 'S', 'Siemens', 'an electric conductance'),
 (16, 'ElectricCurrent', 'Electric Current', 'A', 'Ampere', 'the amount of electric charge flowing past a specified circuit point per unit time'),
 (17, 'ElectricInductance', 'Electric Inductance', 'H', 'Henry', 'an electric inductance'),
 (18, 'ElectricPotential', 'Electric Potential', 'V', 'Volt', 'an electric potential or electromotive force'),
 (19, 'ElectricResistance', 'Electric Resistance', 'Ω', 'Ohm', 'an electric resistance'),
 (20, 'Energy', 'Energy', 'J', 'Joule', 'the capacity of a physical system to do work'),
 (21, 'Force', 'Force', 'N', 'Newton', 'a quantity that tends to produce an acceleration of a body in the direction of its application'),
 (22, 'Frequency', 'Frequency', 'Hz', 'Hertz', 'the number of times a specified phenomenon occurs within a specified interval'),
 (23, 'Illuminance', 'Illuminance', 'lx', 'lux', 'an illuminance'),
 (24, 'KinematicViscosity', 'Kinematic Viscosity', 'm²/s', NULL, 'the diffusion of momentum'),
 (25, 'Length', 'Length', 'm', 'meter', 'the extent of something along its greatest dimension or the extent of space between two objects or places'),
 (26, 'LuminousFlux', 'Luminous Flux', 'lm', 'lumen', 'a luminous flux'),
 (27, 'LuminousIntensity', 'Luminous Intensity', 'cd', 'candela', 'the luminous flux density per solid angle as measured in a given direction relative to the emitting source'),
 (28, 'MagneticFlux', 'Magnetic Flux', 'Wb', 'Weber', 'a magnetic flux'),
 (29, 'MagneticFluxDensity', 'Magnetic Flux Density', 'T', 'Tesla', 'a magnetic flux density'),
 (30, 'Mass', 'Mass', 'kg', 'kilogram', 'the measure of the quantity of matter that a body or an object contains'),
 (31, 'MassFlowRate', 'Mass Flow Rate', 'kg/s', 'kilogram per second', 'the movement of mass per time'),
 (32, 'Money', 'Money', NULL, NULL, 'something generally accepted as a medium of exchange, a measure of value, or a means of payment'),
 (33, 'Power', 'Power', 'W', 'Watt', 'the rate at which work is done'),
 (34, 'Pressure', 'Pressure', 'Pa', 'Pascal', 'a force applied uniformly over a surface'),
 (35, 'RadiationDoseAbsorbed', 'Radiation Dose Absorbed', 'Gy', 'Gray', 'the amount of energy deposited per unit of mass'),
 (36, 'RadiationDoseEffective', 'Radiation Dose Effective', 'equivalent) dose of radiation received by a human or some other living organism. The system unit for this quantity is Sv', 'or "equivalent" dose of radiation received by a human or some other living organism. The system unit for this quantity is "Sv" Sievert', 'the effective (or "equivalent") dose of radiation received by a human or some other living organism'),
 (37, 'RadioactiveActivity', 'Radioactive Activity', 'Bq', 'Becquerel', 'a radioactive activity'),
 (38, 'SolidAngle', 'Solid Angle', 'sr', 'steradian', 'the angle formed by three or more planes intersecting at a common point'),
 (39, 'Temperature', 'Temperature', 'K', 'Kelvin', 'the degree of hotness or coldness of a body or an environment'),
 (40, 'Torque', 'Torque', 'N·m', 'Newton-Meter', 'the moment of a force'),
 (41, 'Velocity', 'Velocity', 'm/s', 'meter per second', 'a distance traveled divided by the time of travel'),
 (42, 'Volume', 'Volume', 'm³', 'cubic meter', 'the amount of space occupied by a three-dimensional object or region of space, expressed in cubic units'),
 (43, 'VolumetricDensity', 'Volumetric Density', 'kg/m³', 'kilogram per cubic meter', 'a mass per unit volume of a substance under specified conditions of pressure and temperature'),
 (44, 'VolumetricFlowRate', 'Volumetric Flow Rate', 'm³/s', 'cubic meter per second', 'the volume of fluid passing a point in a system per unit of time');

COMMIT;
