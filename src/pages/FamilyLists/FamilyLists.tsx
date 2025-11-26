import React, { useEffect, useState } from "react";
import { fetchKids, fetchPeople } from "../../utils/firebase/firebaseUtils"; // Import the fetchPeople function
import styles from "./FamilyLists.module.less"; // Assuming you have some styles for the grid
import { PersonInfo, Kid } from "../../utils/types";

interface FamilyListsProps {
  onSelectPerson?: (email: string, uid: string, name: string) => void;
  loggedInEmail: string;
  loggedInUid: string;
  setOnList: (value: boolean) => void;
}

interface Person {
  email: string;
  name: string;
}

// interface Kid {
//   parentEmail: string; // Email of the parent
//   name: string; // Name of the kid
// }

const FamilyLists = ({
  onSelectPerson,
  loggedInEmail,
  loggedInUid,
  setOnList,
}: FamilyListsProps) => {
  const [people, setPeople] = useState<PersonInfo[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  console.log(people);

  useEffect(() => {
    const fetchPeopleData = async () => {
      const peopleList = await fetchPeople(loggedInUid);
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

  const handleSelectPerson = (uid: string, email: string, name: string) => {
    onSelectPerson(uid, email, name);
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
              key={person.uid}
              className={styles.personBox}
              onClick={() => handleSelectPerson(person.uid, person.email, person.name)}
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
              onClick={() => handleSelectPerson(kid.uid, null, kid.name)}
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
