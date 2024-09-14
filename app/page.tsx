"use client"

import clsx from "clsx";
import { useRouter } from 'next/navigation'
import { ComponentProps, ReactNode, useEffect } from "react";
import { checkSession, signInWithGoogle } from "@/auth";
import { SignInIcon } from "@/icons";
import { MarketingLayout } from "@/layouts/Marketing"; // Assuming this is part of your project
import { Button, LinkButton } from "@/primitives/Button";
import { Container } from "@/primitives/Container";
import styles from "./page.module.css";

interface FeatureProps extends Omit<ComponentProps<"div">, "title"> {
  description: ReactNode;
  title: ReactNode;
}

function Feature({ title, description, className, ...props }: FeatureProps) {
  return (
    <div className={clsx(className, styles.featuresFeature)} {...props}>
      <h4 className={styles.featuresFeatureTitle}>{title}</h4>
      <p className={styles.featuresFeatureDescription}>{description}</p>
    </div>
  );
}

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const checkUserSession = async () => {
      const sessionData = await checkSession();
      const session = sessionData.session;
      if (session) {
        // Redirect to the dashboard if session exists
        router.push("/dashboard")
      }
    };

    checkUserSession();
  }, []);

  return (
    <MarketingLayout>
      <Container className={styles.section}>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroTitle}>
            Take advantage of your college years
          </h1>
          <p className={styles.heroLead}>
            Use intrascope to find all student benefits, discounts, scholarships, and more.
          </p>
        </div>
        <div className={styles.heroActions}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signInWithGoogle();
            }}
          >
            <Button icon={<SignInIcon />}>Sign in with Google</Button>
          </form>
          <LinkButton
            href="https://liveblocks.io/docs/guides/nextjs-starter-kit"
            target="_blank"
            variant="secondary"
          >
            Learn more
          </LinkButton>
        </div>
      </Container>
      <Container className={styles.section}>
        <h2 className={styles.sectionTitle}>Features</h2>
        <div className={styles.featuresGrid}>
          <Feature
            description="AI is integrated into Intrascope to find more opportunities for you than any other provider."
            title="AI"
          />
          <Feature
            description="We have the largest database of student discounts, benefits, and scholarships."
            title="Our Database"
          />
          <Feature
            description="We designed Intrascope to be as minimal, and to the point as possible."
            title="Simplicity"
          />
          <Feature
            description="We are always updating our database to include the latest, and best offers for students."
            title="New Opportunities"
          />
          <Feature
            description="Users are assigned profiles that keep information readily available."
            title="User Profiles"
          />
          <Feature
            description="Inboxes keep the most updated offers in one place, making sure you never miss out."
            title="Inbox"
          />
        </div>
      </Container>
    </MarketingLayout>
  );
}
