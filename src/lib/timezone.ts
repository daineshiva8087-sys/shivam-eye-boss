/**
 * IST (India Standard Time) Timezone Utilities
 * Timezone: Asia/Kolkata
 * Location: Jalna, Maharashtra
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date and time in IST
 */
export function getISTDateTime(): Date {
  // Create a date string in IST and parse it back
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: IST_TIMEZONE });
  return new Date(istString);
}

/**
 * Get current date in YYYY-MM-DD format (IST)
 */
export function getISTDateString(): string {
  const ist = getISTDateTime();
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time in HH:mm format (24-hour, for comparisons)
 */
export function getISTTimeString24(): string {
  const ist = getISTDateTime();
  const hours = String(ist.getHours()).padStart(2, '0');
  const minutes = String(ist.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get current time in 12-hour format with AM/PM (for display)
 */
export function getISTTimeString12(): string {
  const ist = getISTDateTime();
  let hours = ist.getHours();
  const minutes = String(ist.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Format a date string to readable format (e.g., "09 Feb 2026")
 */
export function formatISTDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TIMEZONE
  });
}

/**
 * Convert HH:mm or HH:mm:ss time to 12-hour format with AM/PM
 */
export function formatTime12Hour(timeString: string): string {
  if (!timeString) return '';
  const [hoursStr, minutesStr] = timeString.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes.substring(0, 2)} ${ampm}`;
}

/**
 * Get time difference in minutes between now and a target time (same day)
 */
export function getMinutesUntil(targetTime: string): number {
  const ist = getISTDateTime();
  const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();
  const targetTotalMinutes = targetHours * 60 + targetMinutes;
  return targetTotalMinutes - currentMinutes;
}

/**
 * Get time difference in minutes from a target time to now
 */
export function getMinutesSince(targetTime: string): number {
  return -getMinutesUntil(targetTime);
}

/**
 * Format minutes to human readable string
 */
export function formatMinutesToReadable(minutes: number): string {
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Check if current IST time is between start and end times
 */
export function isTimeInRange(startTime: string | null, endTime: string | null): boolean {
  if (!startTime || !endTime) return true; // No time restriction
  
  const currentTime = getISTTimeString24();
  const start = startTime.substring(0, 5);
  const end = endTime.substring(0, 5);
  
  return currentTime >= start && currentTime <= end;
}

/**
 * Check if current IST date is between start and end dates
 */
export function isDateInRange(startDate: string | null, endDate: string | null): boolean {
  const currentDate = getISTDateString();
  
  if (startDate && currentDate < startDate) return false;
  if (endDate && currentDate > endDate) return false;
  
  return true;
}

/**
 * Get banner status based on schedule
 */
export type BannerStatus = 
  | { status: 'live'; message: string; endTime?: string }
  | { status: 'upcoming'; message: string; minutesUntil: number }
  | { status: 'scheduled'; message: string; startDate: string }
  | { status: 'expired'; message: string }
  | { status: 'off'; message: string };

export function getBannerStatus(
  isActive: boolean,
  startDate: string | null,
  endDate: string | null,
  startTime: string | null,
  endTime: string | null
): BannerStatus {
  // Check if banner is manually turned off
  if (!isActive) {
    return { status: 'off', message: '❌ Banner OFF' };
  }

  const currentDate = getISTDateString();
  const currentTime = getISTTimeString24();

  // Check if expired (past end date)
  if (endDate && currentDate > endDate) {
    return { 
      status: 'expired', 
      message: `🔴 Expired on ${formatISTDate(endDate)}` 
    };
  }

  // Check if scheduled for future date
  if (startDate && currentDate < startDate) {
    return { 
      status: 'scheduled', 
      message: `🕒 Scheduled for ${formatISTDate(startDate)}`,
      startDate 
    };
  }

  // We're on a valid date, now check time
  const start = startTime?.substring(0, 5) || '00:00';
  const end = endTime?.substring(0, 5) || '23:59';

  // Check if before start time today
  if (startTime && currentTime < start) {
    const minutesUntil = getMinutesUntil(start);
    if (minutesUntil <= 60) {
      return {
        status: 'upcoming',
        message: `⏳ Will go LIVE in ${formatMinutesToReadable(minutesUntil)} (${formatTime12Hour(startTime)})`,
        minutesUntil
      };
    }
    return {
      status: 'scheduled',
      message: `🕒 Scheduled for Today at ${formatTime12Hour(startTime)}`,
      startDate: currentDate
    };
  }

  // Check if after end time today
  if (endTime && currentTime > end) {
    return {
      status: 'expired',
      message: `🔴 Expired at ${formatTime12Hour(endTime)}`
    };
  }

  // Banner is LIVE!
  if (endTime) {
    return {
      status: 'live',
      message: `🟢 LIVE NOW`,
      endTime: formatTime12Hour(endTime)
    };
  }

  return {
    status: 'live',
    message: `🟢 LIVE NOW`
  };
}

/**
 * Check if a banner should be visible right now
 */
export function isBannerVisible(
  isActive: boolean,
  startDate: string | null,
  endDate: string | null,
  startTime: string | null,
  endTime: string | null
): boolean {
  const status = getBannerStatus(isActive, startDate, endDate, startTime, endTime);
  return status.status === 'live';
}
