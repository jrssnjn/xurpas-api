import { Request, Response } from 'express'
import {
   config,
   parkingSpots,
   addToParkedVehicles,
   updateParkingSpotToUnavailable,
   closestAvailableParkingSpot,
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

      if (cursor.length === 0)
         return res.status(500).json({ message: 'no available parking spots' })

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

      if (!closest)
         return res.status(500).json({ message: 'no available parking spot' })

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
