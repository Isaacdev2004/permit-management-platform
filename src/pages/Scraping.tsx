import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const CITIES = ["Austin, TX", "Houston, TX", "Dallas, TX", "San Antonio, TX"];

export default function Scraping() {
  const [selectedCity, setSelectedCity] = useState("Austin, TX");
  const [scraping, setScraping] = useState(false);

  const handleScrape = async () => {
    setScraping(true);
    try {
      const response = await apiClient.scrapePermits(selectedCity);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Scrape Permits</CardTitle>
          <CardDescription>
            Scrape new permits from a selected city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Label htmlFor="city">City</Label>
            <Select onValueChange={setSelectedCity} defaultValue={selectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleScrape} disabled={scraping}>
            {scraping ? "Scraping..." : "Scrape"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
