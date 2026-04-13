"use client"
import { convertTo24Hour, minutesToTime, toLocalYMD } from '@/lib/dateUtils';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useDoctorStore } from '@/store/doctorStore';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function page() {
    const params = useParams();
    const router = useRouter();
    const doctorId = params.doctorId as any;

    const { currentDoctor, fetchDoctorById } = useDoctorStore();
    const { bookAppointment, loading, fetchBookedSlots, bookedSlots } = useAppointmentStore();

    //state
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedSlot, setSelectedSlot] = useState("");
    const [consultationType, setConsultationType] = useState("Video Consultation");
    const [symptoms, setSymptoms] = useState("");
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null)
    const [patientName, setPatientName] = useState<string>('');

    useEffect(() => {
        if (doctorId) {
            fetchDoctorById(doctorId);
        }
    }, [doctorId, fetchDoctorById]);

    useEffect(() => {
        if (selectedDate && doctorId) {
            const dateString = toLocalYMD(selectedDate);
            fetchBookedSlots(doctorId, dateString);
        }
    }, [selectedDate, doctorId, fetchBookedSlots]);

    //Generate avaiable dates
    useEffect(() => {
        if (currentDoctor?.availabilityRange) {
            const startDate = new Date(currentDoctor?.availabilityRange.startDate);
            //Convert doctor's start date string into a Date Object

            const endDate = new Date(currentDoctor?.availabilityRange.endDate);
            //Convert doctor's end date string into a Date Object

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            //get today's date and reset time to midnight

            const dates: string[] = [];
            //Empty list to hold avaiable dates

            const iterationStart = new Date(
                Math.max(today.getTime(), startDate.getTime())
            );

            for (
                let d = new Date(iterationStart);
                d <= endDate && dates.length < 90;
                d.setDate(d.getDate() + 1)
            ) {
                dates.push(toLocalYMD(d));
                //Convert date into YYYY-MM-DD format and add to list
            }

            setAvailableDates(dates);
        }
    }, [currentDoctor]);

    //Generate avaiable slots
    useEffect(() => {
        if (selectedDate && currentDoctor?.dailyTimeRanges) {
            const slots: string[] = [];
            //Empty list to hold avaiable dates

            const slotDuration = currentDoctor?.slotDurationMinutes || 30;

            currentDoctor.dailyTimeRanges.forEach((timeRange: any) => {
                const startMintues = timeToMinutes(timeRange.start);
                //Convert start time (e.g, "12:00") => total mintues (e.g., 540)

                const endMintues = timeToMinutes(timeRange.end);
                //Convert end time (e.g, "3:00") => total mintues (e.g., 740)

                for (
                    let mintues = startMintues;
                    mintues < endMintues;
                    mintues += slotDuration
                ) {
                    slots.push(minutesToTime(mintues));

                    //Convert mintues back to HH:MM format and add to slots
                }
            });

            setAvailableSlots(slots);
        }
    }, [selectedDate, currentDoctor]);

    const timeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedSlot || !symptoms.trim()) {
            alert("please complete all required fields");
            return;
        }

        setIsPaymentProcessing(true);
        try {
            const dateString = toLocalYMD(selectedDate);
            const slotStart = new Date(
                `${dateString}T${convertTo24Hour(selectedSlot)}`
            );
            const slotEnd = new Date(
                slotStart.getTime() + (currentDoctor!.slotDurationMinutes || 30) * 60000
            );
            const consultationFees = getConsultationPrice();
            const platformFees = Math.round(consultationFees * 0.1);
            const totalAmount = consultationFees + platformFees;

            const appointment = await bookAppointment({
                doctorId: doctorId,
                slotStartIso: slotStart.toISOString(),
                slotEndIso: slotEnd.toISOString(),
                consultationType,
                symptoms,
                date: dateString,
                consultationFees,
                platformFees,
                totalAmount,
            });


            //store appointemnt Id and patinet name for paymnet 
            if (appointment && appointment?._id) {
                setCreatedAppointmentId(appointment._id);
                setPatientName(appointment.patientId.name || 'Patient')
            } else {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                router.push("/patient/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            setIsPaymentProcessing(false);
        }
    };

    const getConsultationPrice = (): number => {
        const basePrice = currentDoctor?.fees || 0;
        const typePrice = consultationType === "Voice Call" ? -100 : 0;
        return Math.max(0, basePrice + typePrice);
    };

    const handlePaymentSuccess = (appointment: any) => {
        router.push("/patient/dashboard");
    }

    if (!currentDoctor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading doctor information...</p>
                </div>
            </div>
        );
    }

    console.log("this is my current doctor", currentDoctor);

    return (
        <div>
            BOOKING PAGE
        </div>
    )
}

export default page
