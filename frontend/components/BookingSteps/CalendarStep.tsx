import { convertTo24Hour, startOfDay, toLocalYMD } from '@/lib/dateUtils';
import React, { useState } from 'react'
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';

interface CalendarStepProps {
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    selectedSlot: string;
    setSelectedSlot: (slot: string) => void;
    availableSlots: string[];
    availableDates: string[];
    excludedWeekdays: number[];
    onContinue: () => void;
    bookedSlots: string[];
}

function CalendarStep({
    selectedDate, setSelectedDate, selectedSlot,
    setSelectedSlot, availableDates, availableSlots,
    excludedWeekdays, onContinue, bookedSlots
}: CalendarStepProps) {

    const [showMoreSlots, setShowMoreSlots] = useState(false);
    const displaySlots = showMoreSlots ? availableSlots : availableSlots.slice(0, 10)

    const isSlotBooked = (slot: string): boolean => {
        if (!selectedDate) {
            return false;
        }
        const dateString = toLocalYMD(selectedDate);
        const slotDateTime = new Date(`${dateString}T${convertTo24Hour(slot)}`);

        return bookedSlots.some((bookedSlot) => {
            const bookedDateTime = new Date(bookedSlot);
            return bookedDateTime.getTime() === slotDateTime.getTime();
        });
    }

    const isSlotInPast = (slot: string): boolean => {
        if (!selectedDate) return false;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDay = new Date(selectedDate);
        selectedDay.setHours(0, 0, 0, 0);

        //Only apply this checkl for today date
        if (selectedDay.getTime() === today.getTime()) {
            const [time, modifier] = slot.split(" ");
            let [hour, minutes] = time.split(":");

            if (hour === "12") {
                hour = "00";
            }

            if (modifier === "PM") {
                hour = String(parseInt(hour, 10) + 12);
            }

            const slotDateTime = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                parseInt(hour, 10),
                parseInt(minutes, 10),
                0
            );

            const bufferedCurrentTime = new Date(now.getTime() + 5 * 60 * 1000);
            return slotDateTime.getTime() <= bufferedCurrentTime.getTime();
        }
        return false;
    };

    const isDateDisabled = (date: Date): boolean => {
        const today = startOfDay(new Date());
        const checkedDate = startOfDay(date)

        if (checkedDate < today) return true;

        const ymd = toLocalYMD(date);
        if (!availableDates.includes(ymd)) return true;

        //check weekday exclusion
        const jsWeekday = date.getDay();  //0= sunday
        return excludedWeekdays.includes(jsWeekday)


    }

    return (
        <div className='space-y-8'>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Select Date & Time
                </h3>

                <div className='grid md:grid-cols-2 gap-8'>
                    <div>
                        <Label className="text-base font-semibold mb-4 block">
                            Choose Date
                        </Label>
                        <div className='border rounded-lg p-4'>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={isDateDisabled}
                                className="rounded-md"
                                classNames={{
                                    day_selected: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 foucus:text-white',
                                    day_today: 'bg-blue-100 text-blue-900 font-bold',
                                    day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed'
                                }}
                            />

                        </div>
                    </div>

                    {/* Time and Slots */}
                    <div>
                        <Label className="text-base font-semibold mb-4 block">
                            Available Time Slots
                            {
                                availableSlots.length > 0 && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({availableSlots.length} slots avaiable)
                                    </span>
                                )
                            }
                        </Label>

                        {
                            selectedDate ? (
                                availableSlots.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 mx-h-80 overflow-y-auto">

                                        </div>

                                    </div>
                                ) 
                            )
                        }

                    </div>

                </div>
            </div>
        </div>
    )
}

export default CalendarStep







