import { VendorLoginForm } from "@/components/auth/vendor-login-form";

export default function VendorLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Tiyende</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bus Reservation Vendor Panel
          </p>
        </div>
        <VendorLoginForm />
      </div>
    </div>
  );
} 