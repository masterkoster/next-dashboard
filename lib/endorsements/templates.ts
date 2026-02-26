export type EndorsementTemplateSeed = {
  authority: 'FAA' | 'EASA'
  name: string
  code: string
  category?: string
  text: string
}

export const ENDORSEMENT_TEMPLATES: EndorsementTemplateSeed[] = [
  // FAA - Student / Solo
  {
    authority: 'FAA',
    name: 'Student Pilot Solo (61.87)',
    code: 'FAA-61.87-SOLO',
    category: 'Student',
    text: 'I certify that [Student Name] has received and logged the training required by §61.87 and is proficient to make solo flights in [Make/Model].',
  },
  {
    authority: 'FAA',
    name: 'Solo Cross-Country (61.93)',
    code: 'FAA-61.93-XC',
    category: 'Student',
    text: 'I certify that [Student Name] has received the required training of §61.93 and is authorized to conduct a solo cross-country flight from [Departure] to [Destination].',
  },
  {
    authority: 'FAA',
    name: 'Night Solo (61.87(o))',
    code: 'FAA-61.87-NIGHT',
    category: 'Student',
    text: 'I certify that [Student Name] has received the required night training and is authorized to conduct solo flight at night in [Make/Model].',
  },
  // FAA - Endorsements
  {
    authority: 'FAA',
    name: 'Complex Aircraft (61.31(e))',
    code: 'FAA-61.31-COMPLEX',
    category: 'Aircraft',
    text: 'I certify that [Pilot Name] has received the required training in a complex airplane and is proficient to act as PIC in a complex airplane.',
  },
  {
    authority: 'FAA',
    name: 'High-Performance (61.31(f))',
    code: 'FAA-61.31-HP',
    category: 'Aircraft',
    text: 'I certify that [Pilot Name] has received the required training in a high-performance airplane and is proficient to act as PIC in a high-performance airplane.',
  },
  {
    authority: 'FAA',
    name: 'Tailwheel (61.31(i))',
    code: 'FAA-61.31-TAIL',
    category: 'Aircraft',
    text: 'I certify that [Pilot Name] has received the required training in a tailwheel airplane and is proficient to act as PIC in a tailwheel airplane.',
  },
  {
    authority: 'FAA',
    name: 'Instrument Proficiency Check (61.57(d))',
    code: 'FAA-61.57-IPC',
    category: 'Currency',
    text: 'I certify that [Pilot Name] has satisfactorily completed an instrument proficiency check in accordance with §61.57(d).',
  },
  {
    authority: 'FAA',
    name: 'Flight Review (61.56)',
    code: 'FAA-61.56-FR',
    category: 'Currency',
    text: 'I certify that [Pilot Name] has satisfactorily completed a flight review in accordance with §61.56.',
  },
  // FAA - Rating / Checkride
  {
    authority: 'FAA',
    name: 'Private Pilot Practical Test Endorsement (61.103)',
    code: 'FAA-61.103-PPL',
    category: 'Checkride',
    text: 'I certify that [Student Name] has received the required training of §61.103 and is prepared for the Private Pilot practical test.',
  },
  {
    authority: 'FAA',
    name: 'Instrument Practical Test Endorsement (61.65)',
    code: 'FAA-61.65-IR',
    category: 'Checkride',
    text: 'I certify that [Student Name] has received the required training of §61.65 and is prepared for the Instrument Rating practical test.',
  },
  {
    authority: 'FAA',
    name: 'Commercial Practical Test Endorsement (61.123)',
    code: 'FAA-61.123-CPL',
    category: 'Checkride',
    text: 'I certify that [Student Name] has received the required training of §61.123 and is prepared for the Commercial Pilot practical test.',
  },
  // FAA - TSA / Misc
  {
    authority: 'FAA',
    name: 'TSA Citizenship Verification',
    code: 'FAA-TSA-CIT',
    category: 'TSA',
    text: 'I certify that I have verified [Student Name]’s citizenship or nationality in accordance with TSA requirements.',
  },

  // EASA - Basic
  {
    authority: 'EASA',
    name: 'LAPL(A) Training Completion',
    code: 'EASA-LAPL-COMP',
    category: 'Training',
    text: 'I certify that [Pilot Name] has completed the required LAPL(A) training and is recommended for skill test.',
  },
  {
    authority: 'EASA',
    name: 'PPL(A) Training Completion',
    code: 'EASA-PPL-COMP',
    category: 'Training',
    text: 'I certify that [Pilot Name] has completed the required PPL(A) training and is recommended for skill test.',
  },
  {
    authority: 'EASA',
    name: 'SEP Revalidation by Experience',
    code: 'EASA-SEP-REVAL',
    category: 'Currency',
    text: 'I certify that [Pilot Name] has met the experience requirements for SEP revalidation by experience.',
  },
  {
    authority: 'EASA',
    name: 'LPC/OPC Completion',
    code: 'EASA-LPC-OPC',
    category: 'Currency',
    text: 'I certify that [Pilot Name] has completed the required LPC/OPC as per EASA requirements.',
  },
  {
    authority: 'EASA',
    name: 'Differences Training (Variable Pitch/Complex)',
    code: 'EASA-DIFF-VP',
    category: 'Aircraft',
    text: 'I certify that [Pilot Name] has completed differences training for [Feature] in accordance with EASA requirements.',
  },
]
