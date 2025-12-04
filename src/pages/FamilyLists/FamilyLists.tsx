import React, { useEffect, useState } from "react";
import { fetchPeople } from "../../utils/firebase/firebaseUtils"; // Import the fetchPeople function
import styles from "./FamilyLists.module.less"; // Assuming you have some styles for the grid
import { PersonInfo, Kid } from "../../utils/types";

interface FamilyListsProps {
  onSelectPerson?: (uid: string, name: string, email?: string) => void;
  loggedInEmail: string;
  loggedInUid: string;
  setOnList: (value: boolean) => void;
}

const FamilyLists = ({
  onSelectPerson,
  loggedInEmail,
  loggedInUid,
  setOnList,
}: FamilyListsProps) => {
  const [adults, setAdults] = useState<PersonInfo[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      setLoading(true);

      const personList = await fetchPeople(loggedInUid);
      const adultList: PersonInfo[] = [];
      const kidList: PersonInfo[] = [];

      personList.forEach((person) => {
        if (person.email != null) {
          adultList.push(person);
        } else {
          kidList.push(person);
        }
      })
      setAdults(adultList);
      setKids(kidList);

      setLoading(false);
    };

    fetchPersonData();
  }, [loggedInEmail]);

  const handleSelectPerson = (uid: string, name: string, email: string) => {
    onSelectPerson(uid, name, email);
    setOnList(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.lists_container}>
      <div className={styles.lists_wrapper}>
        <h2>Adults</h2>
        <div className={styles.grid}>
          {adults.map((adult) => (
            <div
              key={adult.uid}
              className={styles.personBox}
              onClick={() => handleSelectPerson(adult.uid, adult.name, adult.email)}
            >
              {adult.name}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.lists_wrapper}>
        <h2>Kids</h2>
        <div className={styles.grid}>
          {kids.map((kid) => (
            <div
              key={kid.uid}
              className={styles.personBox}
              onClick={() => handleSelectPerson(kid.uid, kid.name, null)}
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
