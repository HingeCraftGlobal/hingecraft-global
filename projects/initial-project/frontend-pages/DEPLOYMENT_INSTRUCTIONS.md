# Frontend Pages Deployment Instructions

**Location:** Wix Editor → Pages → [Page Name] → Add HTML Element

---

## Mission Support Page (`/payment`)

### Steps:

1. Open Wix Editor → Pages → Payment Page
2. Click "Add" → "HTML Element"
3. Set Element ID: `missionSupportForm` or `root`
4. Open `mission-support-form.html`
5. Copy **entire content** from the file
6. Paste into HTML Element
7. Click "Save"
8. Verify form displays correctly

### Verification:

- [ ] Form displays correctly
- [ ] All form fields visible
- [ ] Payment method selector works
- [ ] Form validation works
- [ ] No console errors

---

## Charter Page (`/charter`)

### Steps:

1. Open Wix Editor → Pages → Charter Page
2. Click "Add" → "HTML Element" (or use existing element)
3. Open `charter-page.html`
4. Copy **entire content** from the file
5. Paste into HTML Element
6. Click "Save"
7. Verify page displays correctly

### Verification:

- [ ] Page displays correctly
- [ ] Donation amount displays when URL parameter present
- [ ] Checkout button appears
- [ ] No console errors

---

## Additional Files

### charter-page-other-amount.js

This file contains supporting JavaScript for the Charter page.  
It should be included automatically in `charter-page.html`.

If needed separately:
1. Add as Custom Code → JavaScript
2. Or include in HTML Element

---

## Troubleshooting

**Form not displaying?**
- Verify HTML Element is added to page
- Check Element ID is set correctly
- Ensure entire content is copied (including `<script>` tags)
- Check browser console for errors

**Form validation not working?**
- Verify backend functions are uploaded
- Check function names match exactly
- Verify secrets are configured
- Check network tab for API errors

**Payment redirect not working?**
- Verify payment method selector works
- Check redirect URLs are correct
- Verify backend functions are accessible
- Check console for errors

---

**Status:** Ready for Deployment  
**Next Action:** Add HTML elements to Wix pages
