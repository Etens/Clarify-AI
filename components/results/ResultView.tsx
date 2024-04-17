import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/results/IllustrationCard";

function ResultView() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Card Description</CardDescription>
        </CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Card Description</CardDescription>
        </CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    </div>
  );
}

export default ResultView;
