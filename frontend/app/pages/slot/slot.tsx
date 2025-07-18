import React, { useEffect, useState } from 'react';
import { Typography, Button, Spin, Alert } from 'antd'; // Import Spin and Alert
import { CarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { parkingService, type SlotRecommendation, type OccupyReleasePayload } from '../../api/parkingService'; // Import parkingService and types

const { Title, Paragraph, Text } = Typography;

export function meta() {
  return [{ title: "CarCheese - Slot Assignment" }];
}

// Define mapping for vehicle types to zones
const vehicleTypeToZoneMap: { [key: string]: 'A' | 'B' | 'C' } = {
  'Bike': 'A',
  'Car': 'B',
  'Heavy': 'C',
};

export default function SlotPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Ensure vehicle type is correctly typed as it comes from EntryPage
  const { entryTime, vehicle } = location.state as { entryTime: string; vehicle: { type: 'Bike' | 'Car' | 'Heavy'; plate: string } } || {};

  const [showSplash, setShowSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [countdown, setCountdown] = useState(10); // New state for countdown

  const [recommendedSlot, setRecommendedSlot] = useState<SlotRecommendation['recommended_slot'] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Responsive state (kept for context, but not actively used for styling in this version)
  const [isMobile, setIsMobile] = useState(false);

  // Splash screen effect
  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 700); // Only runs once
    const outTimer = setTimeout(() => setSplashOut(true), 3400);
    const hideTimer = setTimeout(() => setShowSplash(false), 4100);

    return () => {
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Effect to fetch and occupy slot after splash screen is hidden
  useEffect(() => {
    if (!showSplash) { // Only run this effect once the splash screen is gone
      const assignSlot = async () => {
        setApiLoading(true);
        setApiError(null);
        
        // 🔥 NEW LOGS: Confirming received vehicle data
        console.log('SlotPage: Received vehicle data:', vehicle);
        console.log('SlotPage: Received entry time:', entryTime);

        if (!vehicle || !vehicle.type || !vehicle.plate || !entryTime) {
          setApiError("Vehicle data or entry time missing. Cannot assign slot.");
          setApiLoading(false);
          return;
        }

        const targetZone = vehicleTypeToZoneMap[vehicle.type];
        // 🔥 NEW LOG: Confirming target zone
        console.log('SlotPage: Determined targetZone:', targetZone);

        if (!targetZone) {
          setApiError(`No zone defined for vehicle type: ${vehicle.type}.`);
          setApiLoading(false);
          return;
        }

        try {
          // 1. Get Recommended Slot - 🔥 CORRECTED API CALL
          console.log(`Searching for recommended slot for vehicle type: ${vehicle.type} in zone: ${targetZone}`);
          const slotRecResponse = await parkingService.getSlotRecommendation(vehicle.type, vehicle.plate); // Pass vehicleType and vehiclePlate
          // 🔥 NEW LOG: Inspecting raw API response for recommendation
          console.log('SlotPage: Raw slot recommendation API response:', slotRecResponse);
          const fetchedSlot = slotRecResponse.recommended_slot;

          if (!fetchedSlot) {
            setApiError(`No available slots found for ${vehicle.type} in Zone ${targetZone}.`);
            setApiLoading(false);
            return;
          }
          setRecommendedSlot(fetchedSlot);
          // 🔥 NEW LOG: Confirming the zone of the fetched slot
          console.log('SlotPage: Fetched slot ID:', fetchedSlot.slot_id, 'Zone:', fetchedSlot.zone);

          // 2. Occupy the Recommended Slot
          console.log(`Attempting to occupy slot ${fetchedSlot.slot_id} for plate ${vehicle.plate}`);
          const occupyPayload: OccupyReleasePayload = {
            slot_id: fetchedSlot.slot_id,
            vehiclePlate: vehicle.plate,
            entryTime: entryTime, // Pass entryTime received from EntryPage
          };
          await parkingService.occupyParkingSlot(occupyPayload);
          console.log(`Slot ${fetchedSlot.slot_id} occupied successfully.`);

        } catch (err: any) {
          console.error('Error during slot assignment:', err);
          const errorMessage = err.response?.data?.error || err.message || "Failed to assign parking slot.";
          setApiError(errorMessage);
        } finally {
          setApiLoading(false);
        }
      };

      assignSlot();
    }
  }, [showSplash, vehicle, entryTime]); // Dependencies: run when splash is hidden or vehicle/entryTime changes

  // Countdown and auto-redirect effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Only start countdown if API loading is complete and a slot is recommended
    if (!apiLoading && recommendedSlot && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0 && recommendedSlot) {
      // When countdown reaches 0, navigate back to the entry page
      navigate('/entry', { replace: true }); // Use replace: true to prevent going back to this page with browser back button
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [apiLoading, recommendedSlot, countdown, navigate]); // Dependencies for countdown logic

  // SPLASH SCREEN
  if (showSplash) {
    return (
      <div style={{
        minHeight: "100vh", width: "100vw", background: "#fff",
        display: "flex", justifyContent: "center", alignItems: "center",
        position: "fixed", left: 0, top: 0, zIndex: 9999, overflow: "hidden",
        opacity: splashOut ? 0 : 1,
        pointerEvents: splashOut ? "none" : "auto",
        transition: "opacity 1s cubic-bezier(.7,.18,.22,1.09)",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{
            position: "absolute", left: 24, top: 38, width: 90, height: 90,
            borderRadius: 60, background: "#FFD600", opacity: .12, filter: "blur(2.2px)"
          }} />
          <div style={{
            position: "absolute", right: 24, bottom: 30, width: 70, height: 70,
            borderRadius: 38, background: "#FFD600", opacity: .13, filter: "blur(2.3px)"
          }} />
        </div>
        <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <style>{`
            @keyframes text-blink {
              0%,100%{ opacity:1;}
              50%{ opacity:0.25;}
            }
          `}</style>
          <div style={{
            fontWeight: 800,
            fontSize: '1.28rem',
            letterSpacing: .7,
            color: '#222',
            marginBottom: 10,
            textAlign: 'center'
          }}>Searching for a parking slot...</div>
          <div style={{
            fontWeight: 700,
            color: '#FFD600',
            fontSize: 15,
            letterSpacing: .5,
            animation: 'text-blink 1.2s infinite',
            marginTop: 4
          }}>Please wait</div>
        </div>
      </div>
    );
  }

  // MAIN PAGE
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 4vw", // Removed isMobile check for simplicity, adjust if needed
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Bubbles bg */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <div style={{
          position: "absolute", left: -50, top: -40, width: 110, height: 100, borderRadius: 80,
          background: "radial-gradient(circle at 38% 38%, #FFD600cc 68%, #fff0 100%)", filter: "blur(2.3px)", opacity: .14
        }} />
        <div style={{
          position: "absolute", right: -30, bottom: -30, width: 85, height: 85, borderRadius: 60,
          background: "radial-gradient(circle at 53% 53%, #FFD600bb 73%, #fff0 100%)", filter: "blur(1.8px)", opacity: .13
        }} />
      </div>

      {/* Mobil bergerak */}
      <style>
        {`
          @keyframes car-run {
            0% { left: -130px; }
            100% { left: 100vw; }
          }
        `}
      </style>
      <div style={{
        position: "fixed",
        left: 0,
        bottom: 46, // Removed isMobile check
        width: "100vw",
        height: 70,
        pointerEvents: "none",
        zIndex: 12,
        overflow: "visible"
      }}>
        <div style={{
          position: "absolute",
          top: 16, // Removed isMobile check
          left: 0,
          width: 110,
          height: 40,
          animation: "car-run 4.7s linear infinite",
        }}>
          {/* Mobil SVG */}
          <svg width={110} height={40} viewBox="0 0 110 40" fill="none">
            {/* Body */}
            <rect x="18" y="14" width="54" height="15" rx="8" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <rect x="32" y="18" width="22" height="7" rx="3" fill="#fff" />
            {/* Front */}
            <rect x="72" y="18" width="20" height="9" rx="4" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <ellipse cx="90" cy="22.5" rx="4" ry="2.6" fill="#ffe600" stroke="#ffb800" strokeWidth="1.1" />
            {/* Back */}
            <rect x="9" y="18" width="11" height="9" rx="4" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <ellipse cx="11.5" cy="22.5" rx="2.7" ry="1.5" fill="#ff7675" stroke="#ffb800" strokeWidth="1.1" />
            {/* Wheels */}
            <ellipse cx="32" cy="32" rx="6" ry="6" fill="#232323" stroke="#222" strokeWidth="2" />
            <ellipse cx="66" cy="32" rx="6" ry="6" fill="#232323" stroke="#222" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Content utama */}
      <div style={{
        width: "100%",
        maxWidth: 860,
        zIndex: 3,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 28,
        boxShadow: "0 6px 36px #FFD60018, 0 2px 16px #bbb1",
        padding: "46px 54px 44px 52px", // Removed isMobile check
        display: "flex",
        flexDirection: "row", // Removed isMobile check
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 72, // Removed isMobile check
      }}>
        {/* LEFT: Info kendaraan */}
        <div style={{
          flex: 1,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Removed isMobile check
          justifyContent: "center"
        }}>
          <Title style={{
            color: "#222",
            fontSize: "2.65rem", // Removed isMobile check
            fontWeight: 900,
            marginBottom: 11,
            lineHeight: 1.13
          }}>
            Welcome!
          </Title>
          <Paragraph style={{
            color: "#444",
            fontSize: 17, // Removed isMobile check
            maxWidth: 410,
            marginBottom: 20,
            lineHeight: 1.65
          }}>
            <span style={{ color: "#222", fontWeight: 600 }}>
              Here are your vehicle details:
            </span>
          </Paragraph>
          <div style={{
            fontWeight: 700,
            fontSize: 20, // Removed isMobile check
            marginBottom: 10,
            color: "#b9a500",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <CarOutlined style={{ color: "#FFD600", fontSize: 22 }} />
            {vehicle?.type || "Vehicle"}
            <span style={{
              background: "#FFD600",
              color: "#222",
              fontWeight: 900,
              borderRadius: 9,
              padding: "2px 18px",
              fontSize: 22, // Removed isMobile check
              marginLeft: 13
            }}>
              {vehicle?.plate || "Plate"}
            </span>
          </div>
          <div style={{
            color: "#444",
            fontWeight: 500,
            fontSize: 17, // Removed isMobile check
            marginBottom: 24,
            display: "flex", alignItems: "center"
          }}>
            <ClockCircleOutlined style={{ color: "#FFD600", marginRight: 7, fontSize: 18 }} />
            Entry:&nbsp;
            <span style={{ fontWeight: 700, color: "#222" }}>
              {entryTime ? new Date(entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
            </span>
          </div>
        </div>
        {/* RIGHT: Slot info + tombol */}
        <div style={{
          flex: 1,
          minWidth: 300, // Removed isMobile check
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start"
        }}>
          {/* Display loading, error, or recommended slot */}
          {apiLoading ? (
            <Spin size="large" tip="Assigning slot..." style={{ marginTop: 50 }} />
          ) : apiError ? (
            <Alert
              message="Error"
              description={apiError}
              type="error"
              showIcon
              closable
              onClose={() => setApiError(null)}
              action={
                <Button size="small" type="primary" onClick={() => navigate('/entry', { replace: true })}>
                  Back to Entry
                </Button>
              }
              style={{ width: '100%', marginBottom: 20 }}
            />
          ) : recommendedSlot ? (
            <>
              <div style={{
                background: "#FFFDE7",
                borderRadius: 18,
                border: "1.7px solid #FFD600",
                color: "#b9a500",
                fontWeight: 800,
                fontSize: 20, // Removed isMobile check
                padding: "22px 0 13px 0", // Removed isMobile check
                width: 340, // Removed isMobile check
                marginBottom: 28,
                textAlign: "center",
                letterSpacing: 1,
                boxShadow: "0 2px 14px #FFD60013"
              }}>
                <EnvironmentOutlined style={{ color: "#FFD600", fontSize: 22, marginRight: 8 }} />
                <span style={{ color: "#FFD600", fontWeight: 900, fontSize: 21 }}>Level {recommendedSlot.level}</span>
                &nbsp;|&nbsp;
                <span style={{ color: "#FFD600", fontWeight: 800, fontSize: 20 }}>Zone {recommendedSlot.zone}</span>
                <br />
                <span style={{
                  color: "#222",
                  fontWeight: 900,
                  borderRadius: 13,
                  padding: "7px 34px",
                  fontSize: 27, // Removed isMobile check
                  display: "inline-block",
                  background: "#FFD600",
                  marginTop: 10,
                }}>
                  Slot {recommendedSlot.slot_id}
                </span>
              </div>
              <Button
                type="primary"
                size="large"
                style={{
                  background: "linear-gradient(90deg, #FFD600 78%, #FFA726 100%)",
                  color: "#222", fontWeight: 700, border: "none",
                  borderRadius: 22, padding: "0 38px", fontSize: 18,
                  boxShadow: "0 2px 16px #FFD60044", outline: "none"
                }}
                onClick={() => navigate('/entry', { replace: true })} // Use navigate for consistency
              >
                Back to Entry
              </Button>
              {/* Countdown text */}
              <Paragraph style={{ marginTop: 20, fontSize: 15, color: '#888' }}>
                Redirecting to entry page in {countdown} seconds...
              </Paragraph>
            </>
          ) : (
            <Alert
              message="No Slot Found"
              description={apiError || `Could not find an available slot for ${vehicle?.type} in the assigned zone.`}
              type="info"
              showIcon
              action={
                <Button size="small" type="primary" onClick={() => navigate('/entry', { replace: true })}>
                  Back to Entry
                </Button>
              }
              style={{ width: '100%', marginTop: 50 }}
            />
          )}
        </div>
      </div>
      {/* Bottom credit */}
      <div style={{
        textAlign: 'center',
        marginTop: 38, // Removed isMobile check
        color: '#bbb',
        fontSize: 13,
        width: '100%',
        position: 'absolute',
        bottom: 12,
        left: 0
      }}>
        Powered by CarCheese Smart Parking System
      </div>
    </div>
  );
}
