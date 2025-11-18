# Color Palette Quick Reference for Implementation

## Copy-Paste Ready Classes

### Page Container
```jsx
// Remove any bg- classes, let body background show through
className="min-h-screen pb-24 px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 w-full max-w-[1920px] mx-auto"
```

### Glassmorphic Cards
```jsx
// Standard card
className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg"

// With hover
className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
```

### Text Hierarchy
```jsx
// Primary heading
className="text-3xl font-bold text-rich-black dark:text-alice-blue"

// Secondary heading  
className="text-xl font-bold text-rich-black dark:text-alice-blue"

// Body text
className="text-rich-black dark:text-alice-blue"

// Subtle text (60%)
className="text-rich-black/60 dark:text-alice-blue/60"

// Very subtle (40%)
className="text-rich-black/40 dark:text-alice-blue/40"
```

### Buttons

#### Primary Button
```jsx
className="px-6 py-3 bg-picton-blue text-white rounded-xl hover:bg-picton-blue-600 font-semibold transition-all duration-200 active:scale-95"
```

#### Secondary Button
```jsx
className="px-6 py-3 border-2 border-rich-black dark:border-alice-blue text-rich-black dark:text-alice-blue rounded-xl hover:bg-rich-black/5 dark:hover:bg-alice-blue/5 font-semibold transition-all duration-200"
```

#### Danger Button
```jsx
className="px-6 py-3 bg-[#E74C3C] text-white rounded-xl hover:bg-[#C0392B] font-semibold transition-all duration-200"
```

### Semantic Colors

#### Success Badge/Text
```jsx
// Badge
className="px-3 py-1 bg-[#00B894]/20 text-[#00B894] rounded-full text-sm font-semibold"

// Text
className="text-[#00B894] font-semibold"
```

#### Warning Badge/Text
```jsx
// Badge
className="px-3 py-1 bg-[#F2C94C]/20 text-[#F2C94C] rounded-full text-sm font-semibold"

// Text
className="text-[#F2C94C] font-semibold"
```

#### Danger Badge/Text
```jsx
// Badge
className="px-3 py-1 bg-[#E74C3C]/20 text-[#E74C3C] rounded-full text-sm font-semibold"

// Text
className="text-[#E74C3C] font-semibold"
```

### Form Inputs
```jsx
className="w-full px-4 py-3 rounded-xl border border-rich-black/30 dark:border-alice-blue/30 bg-white dark:bg-rich-black text-rich-black dark:text-alice-blue placeholder:text-rich-black/40 dark:placeholder:text-alice-blue/40 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/50 transition-all duration-200"
```

### Icon Containers
```jsx
// Picton Blue
className="w-10 h-10 rounded-xl bg-picton-blue/10 flex items-center justify-center"

// Baby Blue
className="w-10 h-10 rounded-xl bg-baby-blue/10 flex items-center justify-center"

// Success
className="w-10 h-10 rounded-xl bg-[#00B894]/10 flex items-center justify-center"

// Warning
className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center"

// Danger
className="w-10 h-10 rounded-xl bg-[#E74C3C]/10 flex items-center justify-center"
```

### Loading States
```jsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-picton-blue rounded-2xl mb-4 animate-pulse">
      <Icon name="chart" size={32} color="white" ariaLabel="Loading" />
    </div>
    <div className="text-xl text-rich-black dark:text-alice-blue font-medium">Loading...</div>
  </div>
</div>
```

### Error States
```jsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center max-w-md">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl mb-4">
      <Icon name="exclamationCircle" size={32} className="text-red-600 dark:text-red-400" ariaLabel="Error" />
    </div>
    <div className="text-xl text-rich-black dark:text-alice-blue font-semibold mb-2">Error Title</div>
    <div className="text-rich-black/60 dark:text-alice-blue/60 mb-6">{error}</div>
    <button className="px-6 py-3 bg-picton-blue text-white rounded-xl hover:bg-picton-blue-600 font-semibold transition-all duration-200 active:scale-95">
      Retry
    </button>
  </div>
</div>
```

### Table Rows
```jsx
// Hover effect
className="hover:bg-non-photo-blue/40 dark:hover:bg-non-photo-blue/20 transition-colors duration-200"
```

### Status Indicators

#### Submitted/Complete
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00B894]/20 text-[#00B894] rounded-full text-sm font-semibold">
  <Icon name="checkCircle" size={16} />
  Submitted
</span>
```

#### Pending/Late
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F2C94C]/20 text-[#F2C94C] rounded-full text-sm font-semibold">
  <Icon name="clock" size={16} />
  Pending
</span>
```

#### Failed/Overdue
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E74C3C]/20 text-[#E74C3C] rounded-full text-sm font-semibold">
  <Icon name="xCircle" size={16} />
  Overdue
</span>
```

## Find & Replace Patterns

### Old → New Replacements

1. **Background Colors**
   - `bg-gradient-to-br from-blue-50 to-indigo-100` → Remove (use body bg)
   - `bg-white/30 dark:bg-gray-800/30` → `bg-white/80 dark:bg-[#0A2939]/80`
   - `border-white/20 dark:border-gray-700/20` → `border-rich-black/10 dark:border-alice-blue/10`

2. **Text Colors**
   - `text-slate-800 dark:text-white` → `text-rich-black dark:text-alice-blue`
   - `text-gray-600 dark:text-gray-400` → `text-rich-black/60 dark:text-alice-blue/60`
   - `text-gray-400 dark:text-gray-500` → `text-rich-black/40 dark:text-alice-blue/40`

3. **Button Colors**
   - `bg-blue-500` → `bg-picton-blue`
   - `bg-blue-600` → `bg-picton-blue-600`
   - `hover:bg-blue-600` → `hover:bg-picton-blue-600`

4. **Success Colors**
   - `text-green-600` → `text-[#00B894]`
   - `bg-green-100` → `bg-[#00B894]/20`

5. **Warning Colors**
   - `text-yellow-600` → `text-[#F2C94C]`
   - `text-amber-500` → `text-[#F2C94C]`
   - `bg-yellow-100` → `bg-[#F2C94C]/20`

6. **Danger Colors**
   - `text-red-600` → `text-[#E74C3C]`
   - `bg-red-100` → `bg-[#E74C3C]/20`

## Common Mistakes to Avoid

❌ Don't add background to page container
❌ Don't use gradients (except Virtual ID card)
❌ Don't use generic blue colors (use Picton Blue)
❌ Don't use generic green/yellow/red (use semantic colors)
❌ Don't use opacity other than 80% for cards
❌ Don't use border opacity other than 10%

✅ Let body background show through
✅ Use solid semantic colors
✅ Use Picton Blue for all primary actions
✅ Use 80% opacity for all cards
✅ Use 10% opacity for all borders
✅ Use proper text hierarchy (100%, 60%, 40%)
