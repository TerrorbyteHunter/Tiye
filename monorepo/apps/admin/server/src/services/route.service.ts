export class RouteService {
  private routes: any[] = [];

  create(createRouteDto: any) {
    const route = {
      id: this.routes.length + 1,
      ...createRouteDto,
      bookedSeats: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.routes.push(route);
    return route;
  }

  findAll() {
    return this.routes;
  }

  findOne(id: number) {
    return this.routes.find(route => route.id === id);
  }

  update(id: number, updateRouteDto: any) {
    const index = this.routes.findIndex(route => route.id === id);
    if (index === -1) {
      return null;
    }
    this.routes[index] = {
      ...this.routes[index],
      ...updateRouteDto,
      updatedAt: new Date()
    };
    return this.routes[index];
  }

  remove(id: number) {
    const index = this.routes.findIndex(route => route.id === id);
    if (index === -1) {
      return null;
    }
    const route = this.routes[index];
    this.routes.splice(index, 1);
    return route;
  }

  bookSeat(routeId: number, seatNumber: number) {
    const route = this.findOne(routeId);
    if (!route) {
      return null;
    }
    if (!route.bookedSeats) {
      route.bookedSeats = [];
    }
    if (route.bookedSeats.includes(seatNumber)) {
      return null; // Seat already booked
    }
    route.bookedSeats.push(seatNumber);
    route.updatedAt = new Date();
    return route;
  }

  unbookSeat(routeId: number, seatNumber: number) {
    const route = this.findOne(routeId);
    if (!route || !route.bookedSeats) {
      return null;
    }
    const index = route.bookedSeats.indexOf(seatNumber);
    if (index === -1) {
      return null; // Seat not booked
    }
    route.bookedSeats.splice(index, 1);
    route.updatedAt = new Date();
    return route;
  }
} 