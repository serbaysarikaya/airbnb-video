'use client';

import qs from "query-string";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { formatISO } from "date-fns";
import { Range } from "react-date-range";

import Modal from "./Modal";
import CountrySelect, { CountrySelectValue } from "../inputs/CountrySelect";
import Heading from "../Heading";
import Calendar from "../inputs/Calendar";

import useSearchModal from "@/app/hooks/useSearchModal";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";

enum STEPS {
    LOCATION = 0,
    DATE = 1,
    INFO = 2
}

const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();

    const [location, setLocation] = useState<CountrySelectValue>();
    const [step, setStep] = useState(STEPS.LOCATION);
    const [guestCount, setGuestCount] = useState(1);
    const [roomCount, setRoonCount] = useState(1);
    const [bathRoomCount, setBathRoomCount] = useState(1);
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });

    const Map = useMemo(() => dynamic(() => import('../Map'), {
        ssr: false
    }), [location]);

    const onBack = useCallback(() => {
        setStep((value) => value - 1)
    }, []);

    const onNext = useCallback(() => {
        setStep((value) => value + 1)
    }, []);

    const onSubmit = useCallback(async () => {
        if (step !== STEPS.INFO) {
            return onNext();
        }

        let currenQuery = {};

        if (params) {
            currenQuery = qs.parse(params.toString());
        }

        const updateQuery: any = {
            ...currenQuery,
            locationValue: location?.value,
            guestCount,
            roomCount,
            bathRoomCount
        }

        if (dateRange.startDate) {
            updateQuery.startDate = formatISO(dateRange.startDate);
        }

        if (dateRange.endDate) {
            updateQuery.endDate = formatISO(dateRange.endDate);
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updateQuery
        }, { skipNull: true });

        setStep(STEPS.LOCATION);
        searchModal.onClose();
        router.push(url);
    }, [
        step,
        searchModal,
        location,
        router,
        guestCount,
        roomCount,
        bathRoomCount,
        dateRange,
        params,
        onNext

    ]);

    const actionLabel = useMemo(() => {
        if (step === STEPS.INFO) {
            return 'Search';
        }
        return 'Next';
    }, [step]);

    const secondartActionLabel = useMemo(() => {
        if (step === STEPS.LOCATION) {
            return undefined;
        }

        return 'Back';;
    }, [step]);

    let bodyContent = (
        <div className="flex  flex-col gap-8">
            <Heading
                title="Where do you wanna go?"
                subtitle="Find the perfect location" />
            <CountrySelect
                value={location}
                onChange={(value) => setLocation(value as CountrySelectValue)}
            />
            <hr />
            <Map center={location?.latlng} />
        </div>
    );

    if (step === STEPS.DATE) {
        bodyContent = (
            <div className="flex  flex-col gap-8">
                <Heading
                    title="When do you plan to go"
                    subtitle="Make sure every is free!" />
                <Calendar
                    value={dateRange}
                    onChange={(value) => setDateRange(value.selection)}
                />

            </div>
        );
    }

    if (step === STEPS.INFO) {
        bodyContent = (
            <div className="flex  flex-col gap-8">
                <Heading
                    title="More information"
                    subtitle="Find your ferfect place!" />
                <Counter 
                title="Guests"
                subtitle="How many quests are coming?"
                value={guestCount}
                onChange={(value)=>setGuestCount(value)}
                />
                 <Counter 
                title="Rooms"
                subtitle="How many Rooms you need?"
                value={roomCount}
                onChange={(value)=>setRoonCount(value)}
                />
                 <Counter 
                title="Bathrooms"
                subtitle="How many bathrom you need?"
                value={bathRoomCount}
                onChange={(value)=>setBathRoomCount(value)}
                />

            </div>
        );
    }


    return (
        <Modal
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="Filters"
            actionLabel={actionLabel}
            secondaryActionLabel={secondartActionLabel}
            secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
            body={bodyContent}
        />
    );
}


export default SearchModal;