SELECT i.id, i.itemid, i.displayname FROM item i WHERE i.isinactive = 'F' AND (UPPER(i.itemid) LIKE UPPER('%:name%') OR UPPER(i.displayname) LIKE UPPER('%:name%')) ORDER BY i.itemid, i.id
