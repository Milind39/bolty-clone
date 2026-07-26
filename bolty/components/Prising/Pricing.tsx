import React from "react";

import { PricingTable } from "@clerk/nextjs";
import { Card, CardContent } from "../ui/card";

const Pricing = () => {
  return (
    <Card className="border-0">
      <CardContent className=" p-4 bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent border-0">
        <PricingTable
          checkoutProps={{
            appearance: {
              elements: {
                drawerRoot: {
                  zIndex: 200,
                },
                buttonPrimary: {
                  backgroundColor: "#4f46e5", // Indigo-600
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  transition: "all 0.2s ease-in-out",
                },
                buttonPrimary__hover: {
                  backgroundColor: "#4338ca", // Indigo-700
                },
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Pricing;
