import { RouteService } from '../services/route.service';

export class RouteController {
  constructor(
    private readonly routeService: RouteService,
  ) {}

  create(createRouteDto: any) {
    return this.routeService.create(createRouteDto);
  }

  findAll() {
    return this.routeService.findAll();
  }

  findOne(id: string) {
    return this.routeService.findOne(+id);
  }

  async getRouteSeats(id: string) {
    const route = await this.routeService.findOne(+id);
    if (!route) {
      throw new Error(`Route with ID ${id} not found`);
    }

    // Generate seats array based on route capacity
    const seats = Array.from({ length: route.capacity }, (_, i) => ({
      number: i + 1,
      status: 'available'
    }));

    // If route has booked seats, update their status
    if (route.bookedSeats) {
      route.bookedSeats.forEach((seatNumber: number) => {
        const seat = seats.find(s => s.number === seatNumber);
        if (seat) {
          seat.status = 'booked';
        }
      });
    }

    return seats;
  }

  update(id: string, updateRouteDto: any) {
    return this.routeService.update(+id, updateRouteDto);
  }

  remove(id: string) {
    return this.routeService.remove(+id);
  }
} 