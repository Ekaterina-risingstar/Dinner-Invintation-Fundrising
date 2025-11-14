import React, { useState, useEffect, useCallback } from 'react';
import type { FormData, Attendance, MealPreference } from './types';
import InfoItem from './components/InfoItem';
import CustomAlert from './components/CustomAlert';

const initialFormData: FormData = {
  fullName: '',
  attendance: '',
  mealPreference: '',
  allergies: '',
  hasConfirmedPayment: false,
};

const SINGLE_TICKET_PRICE = 37.59;
const IBAN = 'DE89430609674117103300';
const BIC = 'GEMODEM1GLS';
const RECIPIENT = 'Piece Studies Fund e.V.';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalAmount, setTotalAmount] = useState(SINGLE_TICKET_PRICE);
  const [showMailClientAlert, setShowMailClientAlert] = useState(false);

  useEffect(() => {
    const newTotal = formData.attendance === 'partner' ? SINGLE_TICKET_PRICE * 2 : SINGLE_TICKET_PRICE;
    setTotalAmount(newTotal);
  }, [formData.attendance]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRadioChange = useCallback((name: 'attendance' | 'mealPreference', value: Attendance | MealPreference) => {
    if (name === 'attendance' && value === 'donate') {
        setFormData(prev => ({
            ...prev,
            attendance: 'donate',
            mealPreference: '',
            allergies: ''
        }));
    } else {
        setFormData(prev => ({...prev, [name]: value}));
    }
  }, []);

  const isFormValid = formData.fullName && formData.attendance && (formData.attendance === 'donate' || formData.mealPreference) && formData.hasConfirmedPayment;

  const handleConfirmAndSend = () => {
    setShowMailClientAlert(false);

    const subject = `RSVP for Fundraising Dinner: ${formData.fullName}`;
    
    let attendanceText = '';
    switch (formData.attendance) {
      case 'alone':
        attendanceText = 'I will come alone';
        break;
      case 'partner':
        attendanceText = 'I will come with a partner';
        break;
      case 'donate':
        attendanceText = "I'm unable to attend, but have made a donation.";
        break;
    }

    const bodyParts = [
      'Hello,',
      '',
      'Please find my RSVP details below:',
      '',
      `- Full Name: ${formData.fullName}`,
      `- Attendance: ${attendanceText}`,
    ];

    if (formData.attendance !== 'donate') {
      const mealPreferenceText = formData.mealPreference.charAt(0).toUpperCase() + formData.mealPreference.slice(1);
      bodyParts.push(`- Meal Preference: ${mealPreferenceText}`);
      bodyParts.push(`- Allergies/Restrictions: ${formData.allergies || 'None specified'}`);
    }

    bodyParts.push(`- Amount Paid: €${totalAmount.toFixed(2)}`);
    bodyParts.push('', 'Thank you!');

    const body = bodyParts.join('\n');

    const mailtoLink = `mailto:peacestudiesfund@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    
    // We show the thank you message optimistically, assuming the user will send the email.
    // A small delay gives the mail client time to open.
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setShowMailClientAlert(true);
    }
  };
  
  const paymentReferenceText = `${formData.fullName || '{Full Name}'} - ${formData.attendance === 'donate' ? 'Donation' : 'Fundraising Dinner'}`;

  // Standard EPC QR code payload for universal scanning by banking apps
  const epcPayload = [
    'BCD', // Service Tag
    '001', // Version
    '1',   // Character Set (UTF-8)
    'SCT', // Identification Code (SEPA Credit Transfer)
    BIC,
    RECIPIENT,
    IBAN.replace(/\s/g, ''), // IBAN without spaces
    `EUR${totalAmount.toFixed(2)}`,
    paymentReferenceText,    // Purpose (optional)
    '',    // Remittance structured (optional)
    '', // Remittance unstructured
    ''     // Beneficiary to originator info (optional)
  ].join('\n');

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(epcPayload)}`;


  if (isSubmitted) {
    const isDonation = formData.attendance === 'donate';
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-lg shadow-lg text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-emerald-600 mb-4">Thank You!</h1>
          <p className="text-gray-700 mb-6">
            {isDonation
              ? 'Thank you so much for your generous donation! Your support is invaluable to us.'
              : 'Thank you so much for your generosity and for joining our Annual Fundraising Dinner!'}
          </p>
          {!isDonation && (
             <p className="text-gray-700 mb-2">
              We look forward to seeing you on <strong>December 7th</strong> at <strong>19:00</strong> in Innsbruck.
            </p>
          )}
          <div className="mt-8 border-t pt-6">
            <p className="text-gray-600 font-semibold">With heartfelt gratitude,</p>
            <p className="text-gray-500 italic">The Piece Studies Fund e.V. Team</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomAlert
        isOpen={showMailClientAlert}
        onClose={handleConfirmAndSend}
        title="Final Step: Send Your RSVP"
        message="Your email client will now open with a pre-filled RSVP. Please press 'Send' in your email client to complete your registration."
      />
      <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">You're Invited!</h1>
              <p className="text-center text-gray-600 mb-8">
                We warmly invite you to join the Annual Fundraising Dinner hosted by The Piece Studies Fund e.V.
              </p>
              
              <div className="flex flex-col md:flex-row justify-around items-center bg-gray-50 p-6 rounded-lg mb-8 space-y-4 md:space-y-0">
                <InfoItem icon="calendar" text="December 7, 2025" />
                <InfoItem icon="clock" text="19:00" />
                <InfoItem icon="location" text="Innsbruck, Austria" />
              </div>

              {formData.attendance === 'donate' ? (
                <p className="text-gray-700 mb-6 text-center">
                  Even if you can't join us, your generous donation enables us to continue our educational mission in Peace and Conflict Studies at the University of Innsbruck. Thank you for your support!
                </p>
              ) : (
                <p className="text-gray-700 mb-6 text-center">
                  Your participation enables us to continue our educational mission in Peace and Conflict Studies at the University of Innsbruck. The dinner contribution is <strong>€{SINGLE_TICKET_PRICE} per person</strong>.
                </p>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* RSVP Form */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Confirm Your Attendance</h2>
                  
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">
                      🖊 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  {/* Attendance */}
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👫 Attendance <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                      <RadioOption name="attendance" value="alone" label="I will come alone" checked={formData.attendance === 'alone'} onChange={() => handleRadioChange('attendance', 'alone')} />
                      <RadioOption name="attendance" value="partner" label="I will come with a partner" checked={formData.attendance === 'partner'} onChange={() => handleRadioChange('attendance', 'partner')} />
                      <RadioOption name="attendance" value="donate" label="I'm unable to attend, but would love to donate" checked={formData.attendance === 'donate'} onChange={() => handleRadioChange('attendance', 'donate')} />
                    </div>
                  </div>

                  {formData.attendance !== 'donate' && (
                    <>
                      {/* Meal Preference */}
                      <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🍽 Meal Preference <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                          <RadioOption name="mealPreference" value="vegan" label="Vegan" checked={formData.mealPreference === 'vegan'} onChange={() => handleRadioChange('mealPreference', 'vegan')} />
                          <RadioOption name="mealPreference" value="vegetarian" label="Vegetarian" checked={formData.mealPreference === 'vegetarian'} onChange={() => handleRadioChange('mealPreference', 'vegetarian')} />
                          <RadioOption name="mealPreference" value="meat" label="Meat" checked={formData.mealPreference === 'meat'} onChange={() => handleRadioChange('mealPreference', 'meat')} />
                        </div>
                      </div>

                      {/* Allergies */}
                      <div className="mt-6">
                        <label htmlFor="allergies" className="block text-sm font-bold text-gray-700 mb-2">
                          ⚠️ Food Allergies or Dietary Restrictions
                        </label>
                        <textarea
                          id="allergies"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Payment Info */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">💶 Payment Information</h2>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-grow space-y-2 text-sm text-gray-700 w-full">
                        <p><strong>Recipient:</strong> {RECIPIENT}</p>
                        <p><strong>Bank:</strong> GLS Gemeinschaftsbank</p>
                        <p><strong>IBAN:</strong> {IBAN}</p>
                        <p><strong>BIC:</strong> {BIC}</p>
                        <p className="mt-2"><strong>{formData.attendance === 'donate' ? 'Donation Amount' : 'Amount'}:</strong> <span className="font-bold text-indigo-600 text-lg">€{totalAmount.toFixed(2)}</span></p>
                        <p><strong>Payment Reference:</strong> <span className="font-mono bg-gray-200 p-1 rounded text-xs">{paymentReferenceText}</span></p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <p className="text-sm font-bold text-gray-700 mb-1">Scan to Pay</p>
                      <span className="block text-xs text-indigo-600 mb-2">(Open via banking app)</span>
                      <div className="bg-white p-2 border rounded-md inline-block shadow-sm">
                        <img src={qrCodeUrl} alt="Payment QR Code" width="160" height="160" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation and Submit */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex items-start">
                    <input
                      id="hasConfirmedPayment"
                      name="hasConfirmedPayment"
                      type="checkbox"
                      checked={formData.hasConfirmedPayment}
                      onChange={handleChange}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="ml-3 text-sm">
                      <label htmlFor="hasConfirmedPayment" className="font-bold text-gray-700">
                        I confirm that I have paid the amount above. <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    Submit RSVP
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({ name, value, label, checked, onChange }) => (
  <label className="flex-1 min-w-[150px] flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
    />
    <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
  </label>
);


export default App;