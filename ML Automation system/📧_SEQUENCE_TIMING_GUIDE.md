# 📧 Sequence Timing Guide - Complete Configuration

## 🎯 Sequence Timing Rules

### **B2B Sequence (set_three_b2b) - 24-Hour Timing**
- **Step 1:** Partnership Opportunity: Let's Build Together (Immediate)
- **Step 2:** Why HingeCraft? The Value Proposition (24 hours after Step 1)
- **Step 3:** Success Stories: What Partners Are Saying (24 hours after Step 2)
- **Step 4:** Next Steps: How to Get Started (24 hours after Step 3)
- **Step 5:** Final Call: Don't Miss This Opportunity (24 hours after Step 4)
- **Total Duration:** 96 hours (4 days)

### **Student Sequence (set_one_student) - 24-Hour Timing**
- **Step 1:** You're Invited: Help Build the Future (Immediate)
- **Step 2:** Here's What You Just Joined (24 hours after Step 1)
- **Step 3:** Follow the Journey (24 hours after Step 2)
- **Step 4:** Your First Action Step (24 hours after Step 3)
- **Step 5:** Become a Recognized Member (24 hours after Step 4)
- **Total Duration:** 96 hours (4 days)

### **Referral Sequence (set_two_referral) - Individual Trigger**
- **Step 1:** A New $1 Student Pass Just Launched (Individual trigger, not time-based)
- **Total Duration:** Immediate (1 email only)
- **Trigger:** Sent individually when lead is processed (not on a schedule)

---

## 🔍 Qualification Process

### **How System Distinguishes B2B vs Students:**

#### **Student Detection (High Priority):**
- **Company Indicators:** school, university, college, academy, education
- **Title Indicators:** student, teacher, professor, educator
- **Email Domain:** .edu addresses
- **Website Indicators:** education-related domains
- **Result:** `set_one_student` (24-hour timing)

#### **B2B Detection:**
- **Company Indicators:** corp, corporation, inc, llc, ltd, company, business, enterprise
- **Title Indicators:** CEO, founder, director, manager, executive
- **Website Indicators:** business domains
- **Default:** If no clear student/NGO indicators
- **Result:** `set_three_b2b` (24-hour timing)

#### **Referral/NGO Detection:**
- **Company Indicators:** ngo, nonprofit, foundation, charity, organization
- **Title Indicators:** director, coordinator, manager (in nonprofit context)
- **Result:** `set_two_referral` (individual trigger)

---

## ⏰ Timing Implementation

### **B2B and Student Sequences:**
Both use **identical 24-hour timing**:
- Step 1 → Step 2: 24 hours
- Step 2 → Step 3: 24 hours
- Step 3 → Step 4: 24 hours
- Step 4 → Step 5: 24 hours

**Implementation:**
- `automation_next_send_timestamp` set to `now + 24 hours` after each send
- `getContactsReadyForNextStep()` filters by timestamp < now
- Only processes `set_one_student` and `set_three_b2b` (excludes referral)

### **Referral Sequence:**
Uses **individual trigger** (not time-based):
- Sent immediately when lead is processed
- No timestamp waiting
- Processed separately via `processReferralSequences()`
- Only sent once (step 1 = complete)

**Implementation:**
- `processReferralSequences()` finds contacts where:
  - `automation_template_set = set_two_referral`
  - `automation_next_email_step = 1`
  - `automation_emails_sent = 0`
- Sends email immediately
- Marks as complete (step 2 = finished)

---

## 📊 Sequence Flow

### **B2B/Student Flow (Time-Based):**
```
Contact Created
  ↓
Step 1 sent immediately
  ↓
automation_next_send_timestamp = now + 24 hours
  ↓
Wait 24 hours
  ↓
sequenceManager() runs
  ↓
Finds contacts where timestamp < now
  ↓
Step 2 sent
  ↓
automation_next_send_timestamp = now + 24 hours
  ↓
Repeat for steps 3, 4, 5
  ↓
Sequence complete (step 6)
```

### **Referral Flow (Individual Trigger):**
```
Contact Created
  ↓
Qualified as Referral
  ↓
processReferralSequences() runs
  ↓
Finds referral contacts (step 1, emails_sent = 0)
  ↓
Step 1 sent immediately
  ↓
Marked as complete (step 2)
  ↓
No further emails
```

---

## 🔄 System Execution

### **Every Hour (Time-Driven Trigger):**

1. **checkFolderForNewFiles()** runs
2. **sequenceManager()** called
3. **getContactsReadyForNextStep()** queries:
   - B2B contacts ready (timestamp < now)
   - Student contacts ready (timestamp < now)
   - Excludes Referral contacts
4. **Sends emails** for B2B and Student
5. **processReferralSequences()** called
6. **Finds and sends** Referral emails (individual trigger)

---

## ✅ Verification

### **B2B Sequence:**
- ✅ Step 1 sent immediately
- ✅ Step 2 sent 24 hours later
- ✅ Step 3 sent 48 hours later
- ✅ Step 4 sent 72 hours later
- ✅ Step 5 sent 96 hours later
- ✅ Sequence complete

### **Student Sequence:**
- ✅ Step 1 sent immediately
- ✅ Step 2 sent 24 hours later
- ✅ Step 3 sent 48 hours later
- ✅ Step 4 sent 72 hours later
- ✅ Step 5 sent 96 hours later
- ✅ Sequence complete

### **Referral Sequence:**
- ✅ Step 1 sent immediately (individual trigger)
- ✅ No further emails
- ✅ Sequence complete

---

## 🎯 Key Points

1. **B2B and Student:** Same 24-hour timing, different templates
2. **Referral:** Individual trigger, sent immediately, no timing
3. **Qualification:** System properly distinguishes all three types
4. **Execution:** Both time-based and individual triggers handled

---

**Status:** ✅ **SEQUENCE TIMING FULLY CONFIGURED**


