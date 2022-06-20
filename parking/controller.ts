import { Request, Response } from 'express'
import {
   config,
   parkingSpots,
   addToParkedVehicles,
   updateParkingSpotToUnavailable,
   closestAvailableParkingSpot,
   getParkingSize,
   updateParkingSpotToAvailable,
} from './db'

export const getConfiguration = async function (req: Request, res: Response) {
   try {
      const result = await config()

      res.status(200).json(result)
   } catch (error) {
      console.trace(error)
   }
}

export const getParkingSpots = async function (req: Request, res: Response) {
   try {
      const size: string = req.query.size as string
      const entryPoint: string = req.query.entry_point as string

      const sizes = getSizes(+size)

      const cursor = await parkingSpots(+entryPoint, sizes)

      if (cursor.length === 0) return res.status(200).json([])

      res.status(200).json(cursor)
   } catch (error) {
      console.trace(error)
   }
}

export const parkVehicle = async function (req: Request, res: Response) {
   try {
      // get vehicle size and from which it entered
      const size: number = req.body.size
      const entry_point: number = req.body.entryPoint

      let sizes: Array<number> = []

      sizes = getSizes(size)

      // fetch all available parking spots that conforms with vehicle size
      const closest = await closestAvailableParkingSpot(entry_point, sizes)

      if (!closest) return res.status(200).json([])

      const { parkingSpotNumber } = closest

      // get vehicle plate number from user input
      const vehiclePlateNumber: number = req.body.vehiclePlateNumber

      // add to list of parked-vehicles
      const { insertId } = await addToParkedVehicles(
         parkingSpotNumber,
         vehiclePlateNumber
      )

      // remove spot from list of available parking spots
      await updateParkingSpotToUnavailable(parkingSpotNumber)

      // return details of closest available parking spot
      return res
         .status(200)
         .json({ receiptNumber: insertId, parkingSpotNumber })
   } catch (error) {
      console.trace(error)
   }
}

function getSizes(size: number): Array<number> {
   let sizes: Array<number> = []

   if (size === 1) {
      sizes = [1, 2, 3]
   } else if (size === 2) {
      sizes = [2, 3]
   } else if (size === 3) {
      sizes = [3]
   }

   return sizes
}

export const unparkVehicle = async function (req: Request, res: Response) {
   try {
      // get receipt number to fetch parked-vehicle details ex. when was it parked, parking-spot-size, etc..
      const receiptNumber: number = req.body.receiptNumber

      // for demo purposes we supply manually the date and time from when the car was parked.
      const parkedAt: number = req.body.parkedAt

      // fetch default configurations like flat_rate, sp_rate, mp_rate, lp_rate
      const config_details = await config()

      // uncomment below line if parked_at is dynamically pulled from database, comment the parkedAt from req.body as well.
      // const { parked_at, parking_size } = await getParkingSize(receiptNumber)

      // fetch parking-spot-size for computation purposes
      const { parking_size, ps_id, description } = await getParkingSize(
         receiptNumber
      )

      // get current time (will represent time the car attempted to leave parking)
      const leaved_parking_at = new Date()

      // calculate how long car parked
      let hours = Math.round(
         Math.abs(new Date(parkedAt).getTime() - leaved_parking_at.getTime()) /
            36e5
      )

      // assign object type that will include receipt details.

      const response: {
         flatRate?: number
         flatRateTotal?: number
         exceedingHours?: number
         exceedingHourlyRate?: number
         exceedingHourlyTotal?: number
         NumOfDaysTotalFees?: number
         NumOfDaysParked?: number
         total_fees: number
         carSize?: string
      } = {
         total_fees: 0,
      }

      // if hours parked is less than a day (24h), compute just using exceeding hourly rate.
      if (hours < 24) {
         // if hours parked is more than three hours (3h), compute first three hours by flat rate.
         if (hours > 3) {
            hours = hours - 3
            response.flatRate = config_details.flat_rate
            response.flatRateTotal = Number(config_details.flat_rate) * 3
            response.total_fees = Number(config_details.flat_rate) * 3

            // attach size of car metadata
            response.carSize = description
            response.exceedingHours = hours
         }
         // if hours parked is less than three hours (3h), compute just using flat rate.
         else {
            response.flatRate = config_details.flat_rate
            response.flatRateTotal = Number(config_details.flat_rate) * hours
            response.total_fees = Number(config_details.flat_rate) * hours
            return res.status(200).json(response)
         }
      }

      // if hours parked is more than a day (24h), compute using 24 hour chunk rate.
      if (hours >= 24) {
         const num_divided_by = Number((hours / 24).toFixed(0))
         const remaining = hours % 24

         response.NumOfDaysParked = num_divided_by
         response.NumOfDaysTotalFees = 5000 * num_divided_by
         response.total_fees = response.total_fees + response.NumOfDaysTotalFees

         hours = remaining

         if (hours > 0) response.exceedingHours = hours
      }

      let rate: '0.00' | '40.00' | '20.00' | '60.00' = '0.00'

      // check parking-spot-size and assign respective rate
      if (hours > 0) {
         switch (parking_size) {
            case 1:
               rate = config_details.mp_rate
               break
            case 2:
               rate = config_details.mp_rate
               break
            case 3:
               rate = config_details.lp_rate
               break
         }
      }

      // perform computations using rate.
      response.exceedingHourlyRate = Number(rate)
      response.exceedingHourlyTotal = Number(rate) * hours

      response.total_fees = response.total_fees + response.exceedingHourlyTotal

      // update availability so it can be included in list of available parking spots
      await updateParkingSpotToAvailable(ps_id)

      res.status(200).json(response)
   } catch (error) {
      console.trace(error)
   }
}
