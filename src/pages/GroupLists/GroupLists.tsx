import React, { useEffect, useState } from "react";
import { fetchPeople } from "../../utils/firebase/firebaseUtils"; // Import the fetchPeople function
import styles from "./GroupLists.module.less"; // Assuming you have some styles for the grid
import { PersonInfo, Kid } from "../../utils/types";
import { useUser } from "../../context/UserContext";

interface GroupListsProps {
  onSelectPerson?: (uid: string, name: string) => void;
  loggedInUid: string;
  setOnList: (value: boolean) => void;
}

const GroupLists = ({
  onSelectPerson,
  loggedInUid,
  setOnList,
}: GroupListsProps) => {
  const { groupId } = useUser();
  const [adults, setAdults] = useState<PersonInfo[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      setLoading(true);

      const personList = await fetchPeople(groupId, loggedInUid);
      const adultList: PersonInfo[] = [];
      const kidList: PersonInfo[] = [];

      personList.forEach((person) => {
        if (person.email != null) {
          adultList.push(person);
        } else {
          kidList.push(person);
        }
      });

      adultList.sort((a, b) => a.name.localeCompare(b.name));
      kidList.sort((a, b) => a.name.localeCompare(b.name));

      setAdults(adultList);
      setKids(kidList);

      setLoading(false);
    };

    fetchPersonData();
  }, [loggedInUid, groupId]);

  const handleSelectPerson = (uid: string, name: string) => {
    onSelectPerson(uid, name);
    setOnList(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.lists_container}>
      <div className={styles.lists_wrapper}>
        {kids?.length > 0 && <h2>Adults</h2>}
        <div className={styles.grid}>
          {adults.map((adult) => (
            <div
              key={adult.uid}
              className={styles.personBox}
              onClick={() => handleSelectPerson(adult.uid, adult.name)}
            >
              {adult.name}
            </div>
          ))}
        </div>
      </div>
      {kids?.length > 0 && (
        <div className={styles.lists_wrapper}>
          <h2>Kids</h2>
          <div className={styles.grid}>
            {kids.map((kid) => (
              <div
                key={kid.uid}
                className={styles.personBox}
                onClick={() => handleSelectPerson(kid.uid, kid.name)}
              >
                {kid.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupLists;
