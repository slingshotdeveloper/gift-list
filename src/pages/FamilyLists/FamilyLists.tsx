import React, { useEffect, useState } from "react";
import { fetchKids, fetchPeople } from "../../utils/firebase/firebaseUtils"; // Import the fetchPeople function
import styles from "./FamilyLists.module.less"; // Assuming you have some styles for the grid

interface FamilyListsProps {
  onSelectPerson?: (email: string, name: string) => void;
  loggedInEmail: string;
  setOnList: (value: boolean) => void;
}

interface Person {
  email: string;
  name: string;
}

interface Kid {
  parentEmail: string; // Email of the parent
  name: string; // Name of the kid
}

const FamilyLists = ({
  onSelectPerson,
  loggedInEmail,
  setOnList,
}: FamilyListsProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPeopleData = async () => {
      const peopleList = await fetchPeople(loggedInEmail);
      setPeople(peopleList);
    };

    const fetchKidsData = async () => {
      const kidsList = await fetchKids();
      setKids(kidsList);
    };
    setLoading(false);

    fetchPeopleData();
    fetchKidsData();
  }, [loggedInEmail]);

  const handleSelectPerson = (email: string, name: string) => {
    onSelectPerson(email, name);
    setOnList(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.lists_container}>
      <div className={styles.lists_wrapper}>
        <h2>Adults</h2>
        <div className={styles.grid}>
          {people.map((person) => (
            <div
              key={person.email}
              className={styles.personBox}
              onClick={() => handleSelectPerson(person.email, person.name)}
            >
              {person.name}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.lists_wrapper}>
        <h2>Kids</h2>
        <div className={styles.grid}>
          {kids.map((kid) => (
            <div
              key={kid.parentEmail}
              className={styles.personBox}
              onClick={() => handleSelectPerson(null, kid.name)}
            >
              {kid.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyLists;
