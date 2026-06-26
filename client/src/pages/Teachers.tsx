export default function TeachersPage() {
  const teachers = [
    {
      id: 1,
      name: 'Mr. Smith',
      subject: 'Mathematics',
      email: 'smith@school.edu',
      bio: 'Expert in calculus and trigonometry with 15 years of teaching experience.',
      office: 'Room 201'
    },
    {
      id: 2,
      name: 'Ms. Johnson',
      subject: 'English',
      email: 'johnson@school.edu',
      bio: 'Passionate about literature and creative writing. Loves engaging students in discussions.',
      office: 'Room 202'
    },
    {
      id: 3,
      name: 'Dr. Brown',
      subject: 'Science',
      email: 'brown@school.edu',
      bio: 'PhD in Physics. Brings real-world laboratory experience to the classroom.',
      office: 'Room 203'
    },
    {
      id: 4,
      name: 'Ms. Williams',
      subject: 'History',
      email: 'williams@school.edu',
      bio: 'Specializes in world history and helps students understand global perspectives.',
      office: 'Room 204'
    },
    {
      id: 5,
      name: 'Mr. Davis',
      subject: 'Computer Science',
      email: 'davis@school.edu',
      bio: 'Full-stack developer with industry experience. Teaches modern programming practices.',
      office: 'Room 205'
    },
    {
      id: 6,
      name: 'Ms. Martinez',
      subject: 'Art & Design',
      email: 'martinez@school.edu',
      bio: 'Contemporary artist and designer. Encourages creative expression in all forms.',
      office: 'Room 206'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Our Teachers</h2>
        <p className="text-muted-foreground">Meet the dedicated educators shaping our students' futures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="p-6 rounded-xl transition transform hover:scale-105"
            style={{
              background: 'rgba(24, 28, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(37, 80, 140, 0.4)',
              border: '1px solid'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-primary text-lg">{teacher.name}</h3>
                <p className="text-sm text-accent font-semibold">{teacher.subject}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{teacher.bio}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><span className="text-primary font-semibold">Office:</span> {teacher.office}</p>
              <p><span className="text-primary font-semibold">Email:</span> <a href={`mailto:${teacher.email}`} className="text-accent hover:underline">{teacher.email}</a></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
