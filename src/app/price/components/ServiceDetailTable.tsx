"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/shadcn/table";
import { ServicePackage } from "./types";
import { carType } from "./servicesData";
import { useMediaQuery } from "src/lib/hooks/useMediaQuery";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/shadcn/accordion";
import { ArrowLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "src/shadcn/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "src/shadcn/hover-card";

type Props = {
  service: ServicePackage;
};

export default function ServiceDetailTable({ service }: Props) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  if (isMobile) {
    return (
      <div className="space-y-4 px-4 py-2">
        {carType.map((carCategory) => {
          return (
            <Accordion key={carCategory} type="single" collapsible>
              <AccordionItem value={carCategory}>
                <AccordionTrigger className="text-lg font-semibold flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                  {carCategory}
                  <InformationCircleIcon className="w-5 h-5 text-[#007478]" />
                </AccordionTrigger>
                <AccordionContent className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-inner">
                  <div className="space-y-2">
                    {service.content && service.content.map((complex) => {
                      const price = complex.prices.find(
                        (p) => p.carType === carCategory
                      )?.price;

                      return (
                        <div
                          key={complex.name}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {complex.name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {price ? `${price} ₽` : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto py-4 px-2 md:px-6 lg:px-8">
      <div className="relative text-2xl font-bold text-gray-900 dark:text-white mb-6 h-10">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2"
          onClick={() => history.back()}
        >
          <ArrowLeftIcon color="#007478" />
        </Button>
        <div className="text-center w-full border-b-2 border-[#007478]">
          {service.title}
        </div>
      </div>
      <Table className="min-w-[600px] bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <TableHeader>
          <TableRow className="bg-gray-200 dark:bg-gray-700">
            <TableHead
              align="center"
              className="py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Категория авто
            </TableHead>
            {service.content && service.content.map((complex, idx) => (
              <TableHead
                align="center"
                key={idx}
                className="py-4 px-6 font-semibold text-sm text-center text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                <HoverCard key={idx}>
                  <HoverCardTrigger asChild className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2">
                      <span>{complex.name}</span>
                      <Button variant="link" size="icon">
                        <InformationCircleIcon className="w-5 h-5 text-[#007478]" />
                      </Button>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit bg-white dark:bg-gray-900 rounded-lg p-4">
                    <div>
                      <h3 className="text-md font-semibold text-center mb-3">
                        Пошаговый процесс работы
                      </h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {complex.steps.map((value, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {carType.map((carCategory, idx) => (
            <TableRow
              key={idx}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
            >
              <TableCell className="py-5 px-6 text-left text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {carCategory}
              </TableCell>
              {service.content && service.content.map((complex, index) => {
                const price = complex.prices.find(
                  (price) => price.carType === carCategory
                )?.price;
                return (
                  <TableCell
                    key={index}
                    className="text-sm font-medium text-center text-gray-900 dark:text-white"
                  >
                    {price ? `${price} ₽` : "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}