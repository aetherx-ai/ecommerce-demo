export interface BdDistrict {
  name: string;
  upazilas: string[];
}

export interface BdDivision {
  name: string;
  bnName: string;
  districts: BdDistrict[];
}

export const BD_DIVISIONS: BdDivision[] = [
  {
    name: 'Dhaka',
    bnName: 'ঢাকা',
    districts: [
      {
        name: 'Dhaka',
        upazilas: [
          'Dhanmondi',
          'Gulshan',
          'Banani',
          'Uttara',
          'Mirpur',
          'Mohammadpur',
          'Motijheel',
          'Bashundhara R/A',
          'Badda',
          'Jatrabari',
          'Savar',
          'Keraniganj',
        ],
      },
      {
        name: 'Gazipur',
        upazilas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Sreepur', 'Kapasia'],
      },
      {
        name: 'Narayanganj',
        upazilas: ['Narayanganj Sadar', 'Fatullah', 'Siddhirganj', 'Rupganj', 'Sonargaon'],
      },
      {
        name: 'Tangail',
        upazilas: ['Tangail Sadar', 'Mirzapur', 'Kalihati', 'Madhupur'],
      },
    ],
  },
  {
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    districts: [
      {
        name: 'Chattogram',
        upazilas: [
          'Nasirabad',
          'Agrabad',
          'GEC Circle',
          'Panchlaish',
          'Halishahar',
          'Patenga',
          'Kotwali',
          'Sitakunda',
        ],
      },
      {
        name: "Cox's Bazar",
        upazilas: ["Cox's Bazar Sadar", 'Teknaf', 'Ukhia', 'Chakaria'],
      },
      {
        name: 'Cumilla',
        upazilas: ['Cumilla Sadar', 'Kandirpar', 'Daudkandi', 'Laksam'],
      },
    ],
  },
  {
    name: 'Sylhet',
    bnName: 'সিলেট',
    districts: [
      {
        name: 'Sylhet',
        upazilas: ['Zindabazar', 'Amberkhana', 'Shahjalal Upashahar', 'Beanibazar', 'Golapganj'],
      },
      {
        name: 'Moulvibazar',
        upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura'],
      },
    ],
  },
  {
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    districts: [
      {
        name: 'Rajshahi',
        upazilas: ['Boalia', 'Motihar', 'Shah Makhdum', 'Paba', 'Godagari'],
      },
      {
        name: 'Bogura',
        upazilas: ['Bogura Sadar', 'Sherpur', 'Shajahanpur'],
      },
    ],
  },
  {
    name: 'Khulna',
    bnName: 'খুলনা',
    districts: [
      {
        name: 'Khulna',
        upazilas: ['Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'],
      },
      {
        name: 'Jashore',
        upazilas: ['Jashore Sadar', 'Benapole', 'Jhikargacha'],
      },
    ],
  },
  {
    name: 'Barishal',
    bnName: 'বরিশাল',
    districts: [
      {
        name: 'Barishal',
        upazilas: ['Barishal Sadar', 'Airport', 'Bakerganj'],
      },
    ],
  },
  {
    name: 'Rangpur',
    bnName: 'রংপুর',
    districts: [
      {
        name: 'Rangpur',
        upazilas: ['Rangpur Sadar', 'Mithapukur', 'Pirganj'],
      },
    ],
  },
  {
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    districts: [
      {
        name: 'Mymensingh',
        upazilas: ['Mymensingh Sadar', 'Trishal', 'Bhaluka'],
      },
    ],
  },
];
