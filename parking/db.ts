import { RowDataPacket, OkPacket } from 'mysql2'
import pool from '../config/db'

export const config = function (): Promise<RowDataPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT flat_rate, sp_rate, mp_rate, lp_rate, exceed_day_rate FROM config`,
         (error, rows: RowDataPacket[]) => {
            if (error) reject(error)

            resolve(rows[0])
         }
      )
   })
}

export const getEntryPointdetails = function (
   point?: number
): Promise<RowDataPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT ep.id as parkingSpotNumber FROM entry_points ep WHERE ep.id = ?`,
         [point],
         (error, rows: RowDataPacket[]) => {
            if (error) reject(error)

            resolve(rows[0])
         }
      )
   })
}

export const parkingSpots = function (
   entryPoint: number,
   sizes: number[]
): Promise<RowDataPacket[]> {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT p.id as parkingSpotNumber, distance FROM parking_spot_distances psd INNER JOIN parking_spots p ON psd.parking_spot_id = p.id AND p.is_available = 1 WHERE psd.entry_point_id = ? AND p.parking_size IN (?) ORDER BY distance ASC`,
         [entryPoint, sizes],
         (error, rows: RowDataPacket[]) => {
            if (error) reject(error)

            resolve(rows)
         }
      )
   })
}

export const closestAvailableParkingSpot = function (
   entryPoint: number,
   sizes: number[]
): Promise<RowDataPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT psd.entry_point_id as entryPoint, p.id as parkingSpotNumber, distance FROM parking_spot_distances psd INNER JOIN parking_spots p ON psd.parking_spot_id = p.id AND p.is_available = 1 WHERE psd.entry_point_id = ? AND p.parking_size IN (?) ORDER BY distance ASC`,
         [entryPoint, sizes],
         (error, rows: RowDataPacket[]) => {
            if (error) reject(error)

            resolve(rows[0])
         }
      )
   })
}

export const addToParkedVehicles = function (
   parkingSpotNumber: number,
   vehiclePlateNumber: number
): Promise<OkPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `INSERT INTO parked_vehicles(parking_spot_id, vehicle_plate_number, created_at, updated_at) VALUES(?, ?, ?, ?)`,
         [parkingSpotNumber, vehiclePlateNumber, new Date(), new Date()],
         (error, rows: OkPacket) => {
            if (error) reject(error)

            resolve(rows)
         }
      )
   })
}

export const updateParkingSpotToAvailable = function (
   parkingSpotNumber: number
): Promise<OkPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `UPDATE parking_spots SET is_available = 1 WHERE id = ?`,
         [parkingSpotNumber],
         (error, rows: OkPacket) => {
            if (error) reject(error)

            resolve(rows)
         }
      )
   })
}

export const updateParkingSpotToUnavailable = function (
   parkingSpotNumber: number
): Promise<OkPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `UPDATE parking_spots SET is_available = 0 WHERE id = ?`,
         [parkingSpotNumber],
         (error, rows: OkPacket) => {
            if (error) reject(error)

            resolve(rows)
         }
      )
   })
}

export const getParkingSize = function (
   receiptNumber?: number
): Promise<RowDataPacket> {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT pv.parking_spot_id as ps_id, pv.created_at as parked_at, ps.parking_size FROM parking_spots ps INNER JOIN parked_vehicles pv ON ps.id = pv.parking_spot_id WHERE pv.id = ?`,
         [receiptNumber],
         (error, rows: RowDataPacket[]) => {
            if (error) reject(error)

            resolve(rows[0])
         }
      )
   })
}
