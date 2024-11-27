import React, { useEffect, useState } from "react";
import { fetchPeople } from "../../utils/firebase/firebaseUtils"; // Import the fetchPeople function
import styles from "./FamilyLists.module.less"; // Assuming you have some styles for the grid

interface FamilyListsProps {
  onSelectPerson?: (email: string, name: string) => void;
  loggedInEmail: string;
}

interface Person {
  email: string;
  name: string;
}

const FamilyLists = ({ onSelectPerson, loggedInEmail }: FamilyListsProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPeopleData = async () => {
      const peopleList = await fetchPeople(loggedInEmail);
      setPeople(peopleList);
      setLoading(false);
    };

    fetchPeopleData();
  }, [loggedInEmail]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.grid}>
      {people.map((person) => (
        <div
          key={person.email}
          className={styles.personBox}
          onClick={() => onSelectPerson(person.email, person.name)}
        >
          {person.name}
        </div>
      ))}
    </div>
  );
};

export default FamilyLists;
