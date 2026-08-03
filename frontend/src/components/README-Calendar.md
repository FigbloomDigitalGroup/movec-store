# Custom Calendar & Dropdown Components

## Overview
These components provide a modern, user-friendly interface for the installation booking form with auto-progression functionality.

## Components

### CustomCalendar
A date picker component with a popup calendar interface.

**Features:**
- Clean month-view calendar grid
- Previous/next month navigation
- Visual date selection with highlight
- Availability indicators (colored dots below dates)
- Manual date input support (YYYY-MM-DD format)
- Auto-closes popup after selection
- Auto-progression to next field
- Prevents past date selection
- Keyboard accessible
- Click-outside-to-close

**Props:**
```typescript
interface CustomCalendarProps {
  value: string;              // Current date value (YYYY-MM-DD)
  onChange: (date: string) => void;  // Callback when date changes
  onComplete?: () => void;    // Callback for auto-progression
}
```

**Usage:**
```tsx
<CustomCalendar
  value={preferredDate}
  onChange={setPreferredDate}
  onComplete={handleDateComplete}
/>
```

### CustomDropdown
A styled dropdown component for service selection.

**Features:**
- Custom styling with emerald brand color
- Shows service name and price
- Checkmark for selected item
- Smooth animations
- Auto-progression after selection
- Keyboard accessible
- Click-outside-to-close

**Props:**
```typescript
interface CustomDropdownProps {
  options: DropdownOption[];  // Array of options
  value: string;              // Selected option ID
  onChange: (value: string) => void;  // Callback when selection changes
  placeholder?: string;       // Placeholder text
  onComplete?: () => void;    // Callback for auto-progression
}

interface DropdownOption {
  id: string;
  name: string;
  price?: number;
}
```

**Usage:**
```tsx
<CustomDropdown
  options={services?.map(s => ({
    id: s.id,
    name: s.name,
    price: s.basePrice
  })) || []}
  value={serviceId}
  onChange={setServiceId}
  placeholder="Choose installation service"
  onComplete={handleServiceComplete}
/>
```

## Auto-Progression Flow

1. User selects a service → Auto-focuses on date input
2. User selects/types a date → Auto-focuses on notes field
3. User adds notes (optional) → Can submit form

## Styling
Both components use:
- Tailwind CSS for styling
- Emerald green (#10b982) as primary brand color
- Smooth transitions and animations
- Responsive design
- Consistent spacing and borders

## Calendar Availability Dots
The calendar shows colored dots below certain dates to indicate availability:
- Blue dots: Every 3rd day
- Orange dots: Every 5th day
- Purple dots: Every 7th day

**Note:** This is placeholder logic. Update the logic in `CustomCalendar.tsx` (around line 180) to fetch real availability data from your backend.

## Keyboard Navigation

### Calendar:
- **Click input** → Opens calendar
- **Arrow keys** → Navigate between dates (TODO: can be enhanced)
- **Enter** → Select focused date
- **Escape** → Close calendar
- **Tab** → Navigate controls

### Dropdown:
- **Click button** → Opens dropdown
- **Up/Down arrows** → Navigate options (native behavior)
- **Enter/Space** → Select option
- **Escape** → Close dropdown
- **Tab** → Move to next field

## Accessibility
Both components include:
- ARIA labels and roles
- Screen reader support
- Keyboard navigation
- Focus management
- Semantic HTML

## Customization

### Change Brand Colors
Update the Tailwind classes:
- `bg-emerald-500` → Your primary color
- `ring-emerald-500` → Your focus ring color
- `text-emerald-600` → Your text accent color

### Change Date Format
Update `formatDisplayDate()` in CustomCalendar.tsx to change the display format.

### Change Availability Logic
Update the dots rendering logic in the calendar grid section (lines 178-182) to integrate with your backend availability data.
